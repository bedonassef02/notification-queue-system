// src/domain/entities/notification-log.ts
import { NotificationStatus } from "@prisma/client";

export interface NotificationLog {
  id: string;
  notificationId: string;
  status: NotificationStatus;
  errorMessage?: string | null;
  metadata?: any;
  createdAt: Date;
}
