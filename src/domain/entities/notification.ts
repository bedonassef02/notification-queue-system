// src/domain/entities/notification.ts
import { NotificationStatus, NotificationType } from '@prisma/client';

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  payload: any;
  status: NotificationStatus;
  attempts: number;
  idempotencyKey?: string | null;
  lastAttemptAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
