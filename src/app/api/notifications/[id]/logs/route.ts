import { NotificationService } from '@/application/services/notification-service';
import { ApiResponse } from '@/shared/utils/api-response';

const notificationService = new NotificationService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

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
