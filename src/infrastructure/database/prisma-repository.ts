// src/infrastructure/database/prisma-repository.ts
import { prisma } from './prisma';
import { NotificationStatus, NotificationType } from '@prisma/client';

export class PrismaRepository {
  async getNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
      include: { logs: true },
    });
  }

  async getLogsByNotificationId(notificationId: string) {
    return prisma.notificationLog.findMany({
      where: { notificationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addLog(notificationId: string, status: NotificationStatus, errorMessage?: string, metadata?: any) {
    return prisma.notificationLog.create({
      data: {
        notificationId,
        status,
        errorMessage,
        metadata,
      },
    });
  }

  async updateNotificationStatus(id: string, status: NotificationStatus, attemptsCount?: number) {
    return prisma.notification.update({
      where: { id },
      data: {
        status,
        attempts: attemptsCount !== undefined ? { increment: attemptsCount } : undefined,
        lastAttemptAt: new Date(),
      },
    });
  }
}
