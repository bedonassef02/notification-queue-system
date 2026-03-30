// src/workers/processor.ts
import { Job } from 'bullmq';
import { NotificationRepository } from '@/infrastructure/database/notification-repository';
import { LoggingService } from '@/application/services/logging-service';
import { NotificationStatus, NotificationType } from '@/domain/entities/notification';
import { NotificationProviderFactory } from '@/infrastructure/providers/factory';
import { NotificationJobDataSchema } from '@/shared/validators/job-validator';

/**
 * Notification Processor
 * Handles a single job from BullMQ, interacts with the provider, and records audit logs.
 */
export class NotificationProcessor {
  private notificationRepository: NotificationRepository;
  private loggingService: LoggingService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.loggingService = new LoggingService();
  }

  async process(job: Job) {
    // 0. Validate job data
    const { notificationId } = NotificationJobDataSchema.parse(job.data);
    
    console.log(`Processing notification: ${notificationId} (Job ID: ${job.id})`);

    // 1. Fetch notification
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // 1.5 skip if already sent (Idempotency)
    if (notification.status === NotificationStatus.SENT) {
        console.log(`Notification ${notificationId} already SENT. Skipping to prevent duplicate.`);
        return;
    }

    try {
      // 2. Update status to PROCESSING (internal state)
      await this.notificationRepository.updateStatus(notificationId, NotificationStatus.PROCESSING);
      
      const provider = NotificationProviderFactory.getProvider(notification.type as unknown as NotificationType);
      if (!provider) {
        throw new Error(`No provider found for type: ${notification.type as string}`);
      }

      // 3. Send notification via infrastructure provider
      const response = await provider.send(notification.recipient, notification.payload);

      if (response.success) {
        // 4a. Update to SENT and record success log
        const updated = await this.notificationRepository.updateStatus(notificationId, NotificationStatus.SENT, 1);
        await this.loggingService.logAttempt(
          notificationId, 
          NotificationStatus.SENT, 
          updated.attempts, 
          undefined, 
          response.metadata
        );
      } else {
        // 4b. Handle Failure: Check if this was the last allowed retry
        const isLastAttempt = job.attemptsMade + 1 >= (job.opts?.attempts || 1);
        const finalStatus = isLastAttempt ? NotificationStatus.PERMANENT_FAILURE : NotificationStatus.FAILED;
        
        const updated = await this.notificationRepository.updateStatus(notificationId, finalStatus, 1);
        await this.loggingService.logAttempt(
          notificationId, 
          finalStatus, 
          updated.attempts, 
          response.error, 
          response.metadata
        );

        if (isLastAttempt) {
            console.error(`CRITICAL: Notification ${notificationId} reached max retries and moved to PERMANENT_FAILURE.`);
        }
        
        throw new Error(response.error || 'Unknown provider error');
      }
    } catch (err: any) {
      console.error(`Error processing job ${job.id}:`, err);
      // Re-throw so BullMQ handles the formal retry/fail logic
      throw err;
    }
  }
}
