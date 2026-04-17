// src/infrastructure/database/log-repository.ts
import { prisma } from "./prisma";
import { NotificationLog, LogStatus, CreateLogInput } from "@/domain/entities/notification-log";
import { ILogRepository } from "@/domain/repositories/ilog-repository";

export class LogRepository implements ILogRepository {
  async create(input: CreateLogInput): Promise<NotificationLog> {
    const data = await prisma.notificationLog.create({
      data: {
        notificationId: input.notificationId,
        provider: input.provider,
        status: input.status as any,
        attemptNumber: input.attemptNumber,
        errorMessage: input.errorMessage,
        metadata: input.providerResponse as any
      }
    })

    return this.mapToDomain(data)
  }

  async findByNotificationId(notificationId: string): Promise<NotificationLog[]> {
    const data = await prisma.notificationLog.findMany({
      where: { notificationId },
      orderBy: { createdAt: 'asc' }
    })

    return data.map(item => this.mapToDomain(item))
  }

  async findById(id: string): Promise<NotificationLog | null> {
    const data = await prisma.notificationLog.findUnique({
      where: { id }
    })

    return data ? this.mapToDomain(data) : null
  }

  async delete(id: string): Promise<void> {
    await prisma.notificationLog.delete({
      where: { id }
    })
  }

  async deleteByNotificationId(notificationId: string): Promise<void> {
    await prisma.notificationLog.deleteMany({
      where: { notificationId }
    })
  }

  async findDeadLetters() {
    return prisma.notificationLog.findMany({
      where: {
        status: 'PERMANENT_FAILURE' as any
      },
      include: {
        notification: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  private mapToDomain(data: any): NotificationLog {
    return {
      id: data.id,
      notificationId: data.notificationId,
      provider: 'default',
      status: data.status as LogStatus,
      errorMessage: data.errorMessage || undefined,
      providerResponse: data.metadata as Record<string, unknown> | undefined,
      attemptNumber: data.attemptNumber,
      duration: undefined,
      createdAt: data.createdAt
    }
  }
}
