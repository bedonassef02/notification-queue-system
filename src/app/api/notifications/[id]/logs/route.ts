// src/app/api/notifications/[id]/logs/route.ts
import { NextResponse } from 'next/server';
import { NotificationRepository } from '@/infrastructure/database/notification-repository';
import { LogRepository } from '@/infrastructure/database/log-repository';
import { ApiResponse } from '@/shared/utils/api-response';

const notificationRepository = new NotificationRepository();
const logRepository = new LogRepository();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    // 1. Check if the notification exists
    const notification = await notificationRepository.getNotificationById(notificationId);

    if (!notification) {
      return ApiResponse.error('Notification not found', 404);
    }

    // 2. Fetch logs
    const logs = await logRepository.getLogsByNotificationId(notificationId);

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
