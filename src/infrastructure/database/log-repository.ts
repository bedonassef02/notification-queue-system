// src/infrastructure/database/log-repository.ts
import { prisma } from "./prisma";
import { NotificationStatus } from "@/domain/entities/notification";

export class LogRepository {
  async create(
    notificationId: string,
    status: NotificationStatus,
    attemptNumber: number,
    error?: string,
    metadata?: any,
  ) {
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
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Retrieves all notifications that have reached a terminal failure state.
   */
  async findDeadLetters() {
    return prisma.notificationLog.findMany({
      where: {
        status: NotificationStatus.PERMANENT_FAILURE,
      },
      include: {
        notification: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
