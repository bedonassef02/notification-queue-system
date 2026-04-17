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

export enum LogStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
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

export interface RateLimitConfig {
  id: string
  providerType: NotificationType
  maxJobs: number
  duration: number
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
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

export interface CreateLogInput {
  notificationId: string
  provider: string
  status: LogStatus
  errorMessage?: string
  providerResponse?: Record<string, unknown>
  attemptNumber: number
  duration?: number
}