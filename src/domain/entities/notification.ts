// src/domain/entities/notification.ts
import { z } from 'zod'

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  PERMANENT_FAILURE = 'PERMANENT_FAILURE'
}

export enum NotificationPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Notification {
  id: string
  type: NotificationType
  recipient: string
  payload: Record<string, unknown>
  status: NotificationStatus
  attempts: number
  priority: NotificationPriority
  scheduledAt?: Date
  idempotencyKey?: string
  createdAt: Date
  updatedAt: Date
  lastAttemptAt?: Date
}

export interface CreateNotificationInput {
  type: NotificationType
  recipient: string
  payload: Record<string, unknown>
  priority?: NotificationPriority
  scheduledAt?: Date
  idempotencyKey?: string
}

export interface UpdateNotificationInput {
  status: NotificationStatus
  attempts?: number
  lastAttemptAt?: Date
}

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  recipient: z.string().min(1).max(500),
  payload: z.record(z.unknown()).refine(
    data => JSON.stringify(data).length <= 10000,
    { message: 'Payload must be less than 10KB' }
  ),
  status: z.nativeEnum(NotificationStatus),
  attempts: z.number().int().nonnegative().default(0),
  priority: z.nativeEnum(NotificationPriority).default(NotificationPriority.MEDIUM),
  scheduledAt: z.coerce.date().optional(),
  idempotencyKey: z.string().max(255).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastAttemptAt: z.coerce.date().optional()
})

export const CreateNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  recipient: z.string().min(1).max(500),
  payload: z.record(z.unknown()).refine(
    data => JSON.stringify(data).length <= 10000,
    { message: 'Payload must be less than 10KB' }
  ),
  priority: z.nativeEnum(NotificationPriority).default(NotificationPriority.MEDIUM),
  scheduledAt: z.coerce.date().optional(),
  idempotencyKey: z.string().max(255).optional()
})

export const UpdateNotificationSchema = z.object({
  status: z.nativeEnum(NotificationStatus),
  attempts: z.number().int().nonnegative().optional(),
  lastAttemptAt: z.coerce.date().optional()
})
