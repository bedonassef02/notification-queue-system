import { Job } from "bullmq";
import { NotificationRepository } from "@/infrastructure/database/notification-repository";
import { LoggingService } from "@/application/services/logging-service";
import {
  NotificationStatus,
  NotificationType,
} from "@/domain/entities/notification";
import { NotificationProviderFactory } from "@/infrastructure/providers/factory";
import { NotificationJobDataSchema } from "@/shared/validators/job-validator";
import { validatePayload } from "@/shared/validators/payload-validator";
import {
  InfrastructureError,
  ValidationError,
  AppError,
} from "@/shared/utils/application-error";
import { ZodError } from "zod";

/**
 * Notification Processor
 * Handles a single job from BullMQ, interacts with the provider, and records audit logs.
 * Uses constructor injection for service decoupling and secondary validation for safety.
 */
export class NotificationProcessor {
  constructor(
    private notificationRepository: NotificationRepository = new NotificationRepository(),
    private loggingService: LoggingService = new LoggingService(),
  ) {}

  async process(job: Job) {
    let notificationId: string;

    try {
      // 0. Validate job data
      const validatedJob = NotificationJobDataSchema.parse(job.data);
      notificationId = validatedJob.notificationId;
    } catch (error) {
      console.error(`CRITICAL: Poison pill job data on job ${job.id}:`, error);
      // We can't even find the notification, so we move to failed.
      throw new ValidationError("Invalid Job Data", error);
    }

    console.log(
      `[Worker] Started processing: ${notificationId} (Job ${job.id})`,
    );

    // 1. Fetch notification
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new InfrastructureError(
        `Notification ${notificationId} not found in database`,
      );
    }

    // 1.5 skip if already sent (Idempotency check)
    if (notification.status === NotificationStatus.SENT) {
      console.log(
        `[Worker] Idempotency: ${notificationId} already SENT. Skipping.`,
      );
      return;
    }

    try {
      // 2. Secondary Payload Validation (Safety net for the worker)
      try {
        validatePayload(
          notification.type as NotificationType,
          notification.payload,
        );
      } catch (error) {
        if (error instanceof ZodError) {
          throw ValidationError.fromZod(error);
        }
        throw error;
      }

      // 3. Mark as PROCESSING (formal log)
      const updated = await this.notificationRepository.updateStatus(
        notificationId,
        NotificationStatus.PROCESSING,
      );
      await this.loggingService.logAttempt(
        notificationId,
        NotificationStatus.PROCESSING,
        updated.attempts,
      );

      const provider = NotificationProviderFactory.getProvider(
        notification.type as unknown as NotificationType,
      );

      // 4. Send notification via infrastructure provider
      const response = await provider.send(
        notification.recipient,
        notification.payload,
      );

      if (response.success) {
        // 5a. Success Flow
        const finalUpdate = await this.notificationRepository.updateStatus(
          notificationId,
          NotificationStatus.SENT,
          1,
        );
        await this.loggingService.logAttempt(
          notificationId,
          NotificationStatus.SENT,
          finalUpdate.attempts,
          undefined,
          response.metadata,
        );
        console.log(`[Worker] Successfully delivery: ${notificationId}`);
      } else {
        // 5b. Managed Failure Flow
        await this.handleFailure(
          job,
          notificationId,
          response.error || "Provider rejected",
          response.metadata,
        );
      }
    } catch (err: any) {
      // 6. Infrastructure or Uncaught Failure
      const message =
        err instanceof AppError
          ? err.message
          : `System Failure: ${err.message}`;
      await this.handleFailure(job, notificationId, message, {
        originalError: err,
      });
      throw err; // Re-throw for BullMQ retry
    }
  }

  /**
   * handleFailure - Standardizes failure logic and log updates.
   */
  private async handleFailure(
    job: Job,
    notificationId: string,
    error: string,
    metadata?: any,
  ) {
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts?.attempts || 1);
    const finalStatus = isLastAttempt
      ? NotificationStatus.PERMANENT_FAILURE
      : NotificationStatus.FAILED;

    const updated = await this.notificationRepository.updateStatus(
      notificationId,
      finalStatus,
      1,
    );
    await this.loggingService.logAttempt(
      notificationId,
      finalStatus,
      updated.attempts,
      error,
      metadata,
    );

    if (isLastAttempt) {
      console.error(`[Worker] PERMANENT_FAILURE: ${notificationId} | ${error}`);
    } else {
      console.warn(
        `[Worker] Retry Failure: ${notificationId} | attempt ${job.attemptsMade + 1} | ${error}`,
      );
    }
  }
}
