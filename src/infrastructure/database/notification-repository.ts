// src/infrastructure/database/notification-repository.ts
import { prisma } from "./prisma";
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput
} from "@/domain/entities/notification";
import { INotificationRepository } from "@/domain/repositories/inotification-repository";

export class NotificationRepository implements INotificationRepository {
  async create(input: CreateNotificationInput): Promise<Notification> {
    const priorityMap: Record<NotificationPriority, number> = {
      [NotificationPriority.HIGH]: 2,
      [NotificationPriority.MEDIUM]: 1,
      [NotificationPriority.LOW]: 0
    }

    const data = await prisma.notification.create({
      data: {
        type: input.type,
        recipient: input.recipient,
        payload: input.payload as any,
        status: NotificationStatus.PENDING,
        attempts: 0,
        priority: priorityMap[input.priority || NotificationPriority.MEDIUM],
        scheduledAt: input.scheduledAt,
        idempotencyKey: input.idempotencyKey
      }
    })

    return this.mapToDomain(data)
  }

  async findById(id: string): Promise<Notification | null> {
    const data = await prisma.notification.findUnique({
      where: { id }
    })

    return data ? this.mapToDomain(data) : null
  }

  async findByRecipient(recipient: string): Promise<Notification[]> {
    const data = await prisma.notification.findMany({
      where: { recipient },
      orderBy: { createdAt: 'desc' }
    })

    return data.map(item => this.mapToDomain(item))
  }

  async findByStatus(status: NotificationStatus): Promise<Notification[]> {
    const data = await prisma.notification.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' }
    })

    return data.map(item => this.mapToDomain(item))
  }

  async findManyWithLogs(ids: string[]): Promise<Notification[]> {
    const data = await prisma.notification.findMany({
      where: { id: { in: ids } },
      include: { logs: true }
    })

    return data.map(item => {
      const notification = this.mapToDomain(item)
      return {
        ...notification,
        logs: item.logs.map(log => ({
          id: log.id,
          notificationId: log.notificationId,
          provider: 'default',
          status: log.status as any,
          errorMessage: log.errorMessage || undefined,
          providerResponse: log.metadata as Record<string, unknown> | undefined,
          attemptNumber: log.attemptNumber,
          duration: undefined,
          createdAt: log.createdAt
        }))
      }
    }) as any
  }

  async batchFindByStatus(statuses: NotificationStatus[]): Promise<Notification[]> {
    const data = await prisma.notification.findMany({
      where: { status: { in: statuses as any[] } },
      orderBy: { createdAt: 'desc' }
    })

    return data.map(item => this.mapToDomain(item))
  }

  async findRecent(count: number): Promise<Notification[]> {
    const data = await prisma.notification.findMany({
      take: count,
      orderBy: { createdAt: 'desc' }
    })

    return data.map(item => this.mapToDomain(item))
  }

  async update(id: string, input: UpdateNotificationInput): Promise<Notification> {
    const data = await prisma.notification.update({
      where: { id },
      data: {
        status: input.status as any,
        attempts: input.attempts,
        lastAttemptAt: input.lastAttemptAt
      }
    })

    return this.mapToDomain(data)
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id }
    })
  }

  async findByIdempotencyKey(key: string): Promise<Notification | null> {
    const data = await prisma.notification.findUnique({
      where: { idempotencyKey: key }
    })

    return data ? this.mapToDomain(data) : null
  }

  async batchUpdate(updates: Array<{ id: string; input: UpdateNotificationInput }>): Promise<Notification[]> {
    const results = await Promise.all(
      updates.map(({ id, input }) =>
        prisma.notification.update({
          where: { id },
          data: {
            status: input.status as any,
            attempts: input.attempts,
            lastAttemptAt: input.lastAttemptAt
          }
        })
      )
    )

    return results.map(item => this.mapToDomain(item))
  }

  async updateStatus(
    id: string,
    status: NotificationStatus,
    attemptsCount?: number
  ): Promise<Notification> {
    const data = await prisma.notification.update({
      where: { id },
      data: {
        status: status as any,
        attempts: attemptsCount !== undefined ? { increment: attemptsCount } : undefined,
        lastAttemptAt: new Date()
      }
    })

    return this.mapToDomain(data)
  }

  private mapToDomain(data: any): Notification {
    const priorityValueToEnum: Record<number, NotificationPriority> = {
      2: NotificationPriority.HIGH,
      1: NotificationPriority.MEDIUM,
      0: NotificationPriority.LOW
    }

    return {
      id: data.id,
      type: data.type as NotificationType,
      recipient: data.recipient,
      payload: data.payload as Record<string, unknown>,
      status: data.status as NotificationStatus,
      attempts: data.attempts,
      priority: priorityValueToEnum[data.priority] || NotificationPriority.MEDIUM,
      scheduledAt: data.scheduledAt,
      idempotencyKey: data.idempotencyKey || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastAttemptAt: data.lastAttemptAt
    }
  }
}
