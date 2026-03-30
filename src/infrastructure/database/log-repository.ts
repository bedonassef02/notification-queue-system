// src/infrastructure/database/log-repository.ts
import { prisma } from './prisma';
import { NotificationStatus } from '@/domain/entities/notification';

export class LogRepository {
  async create(notificationId: string, status: NotificationStatus, attemptNumber: number, error?: string, metadata?: any) {
    return prisma.notificationLog.create({
      data: {
        notificationId,
        status: status as any,
        attemptNumber,
        errorMessage: error,
        metadata,
      },
    });
  }

  async findByNotificationId(notificationId: string) {
    return prisma.notificationLog.findMany({
      where: { notificationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
