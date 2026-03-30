// src/application/services/notification-service.ts
import { NotificationRepository } from '@/infrastructure/database/notification-repository';
import { LogRepository } from '@/infrastructure/database/log-repository';
import { enqueueJob } from '@/infrastructure/queue/producer';
import { NotificationType, NotificationStatus } from '@/domain/entities/notification';
import { EnqueueNotificationSchema, EnqueueNotificationInput } from '@/shared/validators/notification-validator';
import { LoggingService } from './logging-service';

/**
 * Notification Service (Controller Pattern)
 * Orchestrates all notification-related data logic.
 */

export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository = new NotificationRepository(),
    private loggingService: LoggingService = new LoggingService()
  ) {}

  /**
   * create - Validates and enqueues a new notification.
   */
  async create(input: EnqueueNotificationInput) {
    // 1. Validate Input
    const validatedInput = EnqueueNotificationSchema.parse(input);

    // 2. Persist to DB (Neon) via Repository
    const scheduledAt = validatedInput.scheduledAt 
      ? new Date(validatedInput.scheduledAt) 
      : null;

    const notification = await this.notificationRepository.upsert({
      type: validatedInput.type as NotificationType,
      recipient: validatedInput.recipient,
      payload: validatedInput.payload,
      idempotencyKey: validatedInput.idempotencyKey,
      priority: validatedInput.priority,
      scheduledAt: scheduledAt,
      status: NotificationStatus.PENDING,
    });

    // 3. Enqueue to Provider-Specific Queue
    // If the record exists and status is already SENT, we skip completely (Idempotency)
    if (notification.status === NotificationStatus.SENT) {
      console.log(`[Idempotency] Notification ${notification.id} already SENT. Skipping enqueue.`);
      return notification;
    }

    if (notification.status === NotificationStatus.PENDING) {
      const delay = scheduledAt 
        ? Math.max(0, scheduledAt.getTime() - Date.now()) 
        : 0;

      await enqueueJob('send-notification', {
        id: notification.id,
        type: notification.type as unknown as NotificationType,
        name: `Notification-${notification.type as string}-${notification.id}`,
        data: { notificationId: notification.id },
        priority: notification.priority,
        delay: delay,
      });
    }

    return notification;
  }

  /**
   * findAll - Retrieves a list of all notification intents.
   */
  async findAll() {
    return this.notificationRepository.findAll();
  }

  /**
   * findById - Fetches a single notification by its internal storage ID.
   */
  async findById(id: string) {
    const notification = await this.notificationRepository.findById(id);
    return notification;
  }

  /**
   * getLogs - Retrieves entire audit log history for a notification delivery.
   */
  async getLogs(notificationId: string) {
    return this.loggingService.getHistory(notificationId);
  }

  /**
   * getDeadLetters - Retrieves all notifications that are permanently failed.
   */
  async getDeadLetters() {
    return this.loggingService.getDeadLetters();
  }
}
