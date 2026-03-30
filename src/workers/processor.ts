// src/workers/processor.ts
import { Job } from 'bullmq';
import { NotificationRepository } from '@/infrastructure/database/notification-repository';
import { LogRepository } from '@/infrastructure/database/log-repository';
import { NotificationStatus, NotificationType } from '@/domain/entities/notification';
import { NotificationProviderFactory } from '@/infrastructure/providers/factory';
import { NotificationJobDataSchema } from '@/shared/validators/job-validator';

export class NotificationProcessor {
  private notificationRepository: NotificationRepository;
  private logRepository: LogRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.logRepository = new LogRepository();
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
      // 2. Update status to PROCESSING
      await this.notificationRepository.updateStatus(notificationId, NotificationStatus.PROCESSING);
      
      const provider = NotificationProviderFactory.getProvider(notification.type as unknown as NotificationType);
      if (!provider) {
        throw new Error(`No provider found for type: ${notification.type as string}`);
      }

      // 3. Send notification
      const response = await provider.send(notification.recipient, notification.payload);

      if (response.success) {
        // 4a. Update to SENT
        await this.notificationRepository.updateStatus(notificationId, NotificationStatus.SENT, 1);
        await this.logRepository.create(notificationId, NotificationStatus.SENT, undefined, response.metadata);
        console.log(`Notification ${notificationId} sent successfully via ${notification.type}`);
      } else {
        // 4b. Update to FAILED and log error
        await this.notificationRepository.updateStatus(notificationId, NotificationStatus.FAILED, 1);
        await this.logRepository.create(notificationId, NotificationStatus.FAILED, response.error, response.metadata);
        throw new Error(response.error || 'Unknown provider error');
      }
    } catch (err: any) {
      console.error(`Error processing job ${job.id}:`, err);
      // Let BullMQ handled retries for thrown errors
      throw err;
    }
  }
}
