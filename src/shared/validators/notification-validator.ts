// src/shared/validators/notification-validator.ts
import { z } from 'zod';
import { NotificationType } from '@/domain/entities/notification';

/**
 * Schema for enqueuing a new notification.
 * Validates the notification type, recipient format, and payload structure.
 */
export const EnqueueNotificationSchema = z.object({
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
  recipient: z.string().min(1, 'Recipient is required'),
  payload: z.record(z.string(), z.any()),
  idempotencyKey: z.string().optional().nullable(),
  priority: z.number().int().min(0).max(100).optional().default(0),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export type EnqueueNotificationInput = z.infer<typeof EnqueueNotificationSchema>;
