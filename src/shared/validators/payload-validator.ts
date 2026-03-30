// src/shared/validators/payload-validator.ts
import { z } from 'zod';
import { NotificationType } from '@/domain/entities/notification';

/**
 * Common payload schemas for all notification types.
 * Used for secondary validation in the worker layer.
 */

export const EmailPayloadSchema = z.object({
  subject: z.string().min(1),
  htmlBody: z.string().optional(),
  body: z.string().optional(),
  fromName: z.string().optional(),
});

export const SMSPayloadSchema = z.object({
  message: z.string().min(1).max(160),
});

export const PushPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  imageUrl: z.string().url().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

/**
 * Validates a payload against its specific notification type.
 */
export function validatePayload(type: NotificationType, payload: any) {
  switch (type) {
    case NotificationType.EMAIL:
      return EmailPayloadSchema.parse(payload);
    case NotificationType.SMS:
      return SMSPayloadSchema.parse(payload);
    case NotificationType.PUSH:
      return PushPayloadSchema.parse(payload);
    default:
      throw new Error(`Unsupported notification type for validation: ${type}`);
  }
}
