// src/infrastructure/database/notification-repository.ts
import { prisma } from './prisma';
import { NotificationType, NotificationStatus } from '@/domain/entities/notification';
import { Notification as PrismaNotification } from '@prisma/client';

export class NotificationRepository {
  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: NotificationStatus, attemptsCount?: number): Promise<PrismaNotification> {
    return prisma.notification.update({
      where: { id },
      data: {
        status: status as any,
        attempts: attemptsCount !== undefined ? { increment: attemptsCount } : undefined,
        lastAttemptAt: new Date(),
      },
    });
  }

  async upsert(input: {
    type: NotificationType;
    recipient: string;
    payload: any;
    idempotencyKey?: string | null;
    priority?: number;
    scheduledAt?: Date | null;
    status: NotificationStatus;
  }): Promise<PrismaNotification> {
    return prisma.notification.upsert({
      where: {
        idempotencyKey: input.idempotencyKey || 'IDEM_KEY_NOT_PROVIDED_' + Date.now(),
      },
      update: {},
      create: {
        type: input.type as any,
        recipient: input.recipient,
        payload: input.payload,
        idempotencyKey: input.idempotencyKey,
        priority: (input.priority || 0) as any,
        scheduledAt: input.scheduledAt as any,
        status: input.status as any,
      },
    });
  }
}
