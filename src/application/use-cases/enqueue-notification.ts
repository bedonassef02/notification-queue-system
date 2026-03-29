// src/application/use-cases/enqueue-notification.ts
import { z } from 'zod';
import { NotificationRepository } from '@/infrastructure/database/notification-repository';
import { enqueueJob } from '@/infrastructure/queue/producer';
import { NotificationType, NotificationStatus } from '@/domain/entities/notification';

export const EnqueueNotificationSchema = z.object({
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
  recipient: z.string().min(1),
  payload: z.record(z.string(), z.any()),
  idempotencyKey: z.string().optional().nullable(),
});

export type EnqueueNotificationInput = z.infer<typeof EnqueueNotificationSchema>;

export class EnqueueNotificationUseCase {
  constructor(private repository: NotificationRepository) {}

  async execute(input: EnqueueNotificationInput) {
    const validatedInput = EnqueueNotificationSchema.parse(input);

    // 1. Persist to PostgreSQL (Neon) via Repository
    const notification = await this.repository.upsertNotification({
      type: validatedInput.type as NotificationType,
      recipient: validatedInput.recipient,
      payload: validatedInput.payload,
      idempotencyKey: validatedInput.idempotencyKey,
      status: NotificationStatus.PENDING,
    });

    // 2. Enqueue to Redis via Unified Producer
    if (notification.status === NotificationStatus.PENDING) {
      await enqueueJob('send-notification', {
        id: notification.id,
        name: `Notification-${notification.type}-${notification.id}`,
        data: { notificationId: notification.id },
      });
    }

    return notification;
  }
}
