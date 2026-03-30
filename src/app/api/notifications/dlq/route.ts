import { NotificationService } from '@/application/services/notification-service';
import { ApiResponse } from '@/shared/utils/api-response';
import { AppError } from '@/shared/utils/application-error';

/**
 * GET /api/notifications/dlq
 * Retrieves all notifications that have reached a PERMANENT_FAILURE state.
 * This acts as the inspection endpoint for the Dead Letter Queue.
 */
export async function GET() {
  const service = new NotificationService();

  try {
    const deadLetters = await service.getDeadLetters();

    return ApiResponse.success({
      count: deadLetters.length,
      data: deadLetters,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.details);
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return ApiResponse.error(message, 500);
  }
}
