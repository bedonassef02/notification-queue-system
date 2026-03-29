// src/app/api/notifications/[id]/logs/route.ts
import { NextResponse } from 'next/server';
import { PrismaRepository } from '@/infrastructure/database/prisma-repository';
import { ApiResponse } from '@/shared/utils/api-response';

const prismaRepository = new PrismaRepository();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    // 1. Check if the notification exists
    const notification = await prismaRepository.getNotificationById(notificationId);

    if (!notification) {
      return ApiResponse.error('Notification not found', 404);
    }

    // 2. Fetch logs
    const logs = await prismaRepository.getLogsByNotificationId(notificationId);

    return ApiResponse.success({
      id: notification.id,
      type: notification.type,
      status: notification.status,
      attempts: notification.attempts,
      logs: logs
    });
  } catch (error) {
    return ApiResponse.error(
      (error as Error).message || 'Internal Server Error',
      500
    );
  }
}
