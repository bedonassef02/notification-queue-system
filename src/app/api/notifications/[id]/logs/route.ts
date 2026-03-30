import { NotificationService } from '@/application/services/notification-service';
import { ApiResponse } from '@/shared/utils/api-response';
import { NextRequest } from 'next/server';

const notificationService = new NotificationService();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await context.params;

    // 1. Fetch notification and logs via Service
    const notification = await notificationService.findById(notificationId);
    if (!notification) {
      return ApiResponse.error('Notification not found', 404);
    }
    
    const logs = await notificationService.getLogs(notificationId);

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
