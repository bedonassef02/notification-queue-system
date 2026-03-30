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
  private notificationRepository: NotificationRepository;
  private loggingService: LoggingService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.loggingService = new LoggingService();
  }

  /**
   * create - Validates and enqueues a new notification.
   */
  async create(input: EnqueueNotificationInput) {
    // 1. Validate Input
    const validatedInput = EnqueueNotificationSchema.parse(input);

    // 2. Persist to DB (Neon) via Repository
    const notification = await this.notificationRepository.upsert({
      type: validatedInput.type as NotificationType,
      recipient: validatedInput.recipient,
      payload: validatedInput.payload,
      idempotencyKey: validatedInput.idempotencyKey,
      status: NotificationStatus.PENDING,
    });

    // 3. Enqueue to Redis via Unified Producer
    if (notification.status === NotificationStatus.PENDING) {
      await enqueueJob('send-notification', {
        id: notification.id,
        name: `Notification-${notification.type as string}-${notification.id}`,
        data: { notificationId: notification.id },
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
}
