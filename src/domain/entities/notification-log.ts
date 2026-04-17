// src/domain/entities/notification-log.ts
import { z } from 'zod'

export enum LogStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface NotificationLog {
  id: string
  notificationId: string
  provider: string
  status: LogStatus
  errorMessage?: string
  providerResponse?: Record<string, unknown>
  attemptNumber: number
  duration?: number
  createdAt: Date
}

export interface CreateLogInput {
  notificationId: string
  provider: string
  status: LogStatus
  errorMessage?: string
  providerResponse?: Record<string, unknown>
  attemptNumber: number
  duration?: number
}

export const NotificationLogSchema = z.object({
  id: z.string().uuid(),
  notificationId: z.string().uuid(),
  provider: z.string().min(1).max(100),
  status: z.nativeEnum(LogStatus),
  errorMessage: z.string().max(2000).optional(),
  providerResponse: z.record(z.unknown()).optional(),
  attemptNumber: z.number().int().positive(),
  duration: z.number().int().nonnegative().optional(),
  createdAt: z.coerce.date()
})

export const CreateLogSchema = z.object({
  notificationId: z.string().uuid(),
  provider: z.string().min(1).max(100),
  status: z.nativeEnum(LogStatus),
  errorMessage: z.string().max(2000).optional(),
  providerResponse: z.record(z.unknown()).optional(),
  attemptNumber: z.number().int().positive(),
  duration: z.number().int().nonnegative().optional()
})
