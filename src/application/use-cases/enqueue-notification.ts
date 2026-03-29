// src/application/use-cases/enqueue-notification.ts
import { z } from 'zod';
import { prisma } from '@/infrastructure/database/prisma';
import { notificationQueue } from '@/infrastructure/queue/bullmq';
import { NotificationType, NotificationStatus } from '@prisma/client';

export const EnqueueNotificationSchema = z.object({
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
  recipient: z.string().min(1),
  payload: z.record(z.string(), z.any()),
  idempotencyKey: z.string().optional().nullable(),
});

export type EnqueueNotificationInput = z.infer<typeof EnqueueNotificationSchema>;

export class EnqueueNotificationUseCase {
  async execute(input: EnqueueNotificationInput) {
    const validatedInput = EnqueueNotificationSchema.parse(input);

    // 1. Persist to PostgreSQL (Neon)
    // Using upsert or similar for idempotency if key provided
    const notification = await prisma.notification.upsert({
      where: {
        idempotencyKey: validatedInput.idempotencyKey || 'IDEM_KEY_NOT_PROVIDED_' + Date.now(),
      },
      update: {}, // Don't do anything if it exists
      create: {
        type: validatedInput.type,
        recipient: validatedInput.recipient,
        payload: validatedInput.payload,
        idempotencyKey: validatedInput.idempotencyKey,
        status: NotificationStatus.PENDING,
      },
    });

    // 2. En-queue to Redis (Upstash / BullMQ)
    // Only enqueue if it was just created OR if it's still pending
    if (notification.status === NotificationStatus.PENDING) {
      await notificationQueue.add(
        'send-notification',
        { notificationId: notification.id },
        { 
          jobId: `notif-${notification.id}`, // Deduplicate in BullMQ if needed
          removeOnComplete: true 
        }
      );
    }

    return notification;
  }
}
