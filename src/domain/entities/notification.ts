// src/domain/entities/notification.ts (Refactored to types/constants)

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  PERMANENT_FAILURE = 'PERMANENT_FAILURE',
}

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  payload: Record<string, any>;
  status: NotificationStatus;
  idempotencyKey?: string | null;
  priority: number;
  scheduledAt?: Date | null;
  attempts: number;
  lastAttemptAt?: Date | null;
  createdAt: Date;
}
