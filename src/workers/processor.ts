// src/workers/processor.ts
import { Job } from 'bullmq';
import { PrismaRepository } from '@/infrastructure/database/prisma-repository';
import { ZeptoMailProvider } from '@/infrastructure/providers/email-zeptomail';
import { TwilioProvider } from '@/infrastructure/providers/sms-twilio';
import { OneSignalProvider } from '@/infrastructure/providers/push-onesignal';
import { INotificationProvider } from '@/domain/repositories/notification-provider';
import { NotificationStatus, NotificationType } from '@prisma/client';

export class NotificationProcessor {
  private prismaRepository: PrismaRepository;
  private providers: Map<NotificationType, INotificationProvider>;

  constructor() {
    this.prismaRepository = new PrismaRepository();
    this.providers = new Map();
    
    // Register providers
    const emailProvider = new ZeptoMailProvider();
    const smsProvider = new TwilioProvider();
    const pushProvider = new OneSignalProvider();
    
    this.providers.set(NotificationType.EMAIL, emailProvider);
    this.providers.set(NotificationType.SMS, smsProvider);
    this.providers.set(NotificationType.PUSH, pushProvider);
  }

  async process(job: Job) {
    const { notificationId } = job.data;
    
    console.log(`Processing notification: ${notificationId}`);
    
    // 1. Fetch notification
    const notification = await this.prismaRepository.getNotificationById(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // skip if already sent
    if (notification.status === NotificationStatus.SENT) return;

    try {
      // 2. Update status to PROCESSING
      await this.prismaRepository.updateNotificationStatus(notificationId, NotificationStatus.PROCESSING);
      
      const provider = this.providers.get(notification.type);
      if (!provider) {
        throw new Error(`No provider found for type: ${notification.type}`);
      }

      // 3. Send notification
      const response = await provider.send(notification.recipient, notification.payload);

      if (response.success) {
        // 4a. Update to SENT
        await this.prismaRepository.updateNotificationStatus(notificationId, NotificationStatus.SENT, 1);
        await this.prismaRepository.addLog(notificationId, NotificationStatus.SENT, undefined, response.metadata);
        console.log(`Notification ${notificationId} sent successfully via ${notification.type}`);
      } else {
        // 4b. Update to FAILED and log error
        await this.prismaRepository.updateNotificationStatus(notificationId, NotificationStatus.FAILED, 1);
        await this.prismaRepository.addLog(notificationId, NotificationStatus.FAILED, response.error, response.metadata);
        throw new Error(response.error || 'Unknown provider error');
      }
    } catch (err: any) {
      console.error(`Error processing job ${job.id}:`, err);
      // Let BullMQ handled retries for thrown errors
      throw err;
    }
  }
}
