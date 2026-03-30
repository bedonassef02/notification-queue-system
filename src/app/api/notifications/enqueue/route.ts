import { NotificationService } from '@/application/services/notification-service';
import { ApiResponse } from '@/shared/utils/api-response';
import { AppError, ValidationError } from '@/shared/utils/application-error';
import { ZodError } from 'zod';

/**
 * POST /api/notifications/enqueue
 * Standard ingestion point for all notification types.
 */
export async function POST(req: Request) {
  const notificationService = new NotificationService();

  try {
    const body = await req.json();
    const result = await notificationService.create(body);

    return ApiResponse.success(
      { id: result.id, status: result.status },
      201,
      'Notification enqueued successfully'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const valError = ValidationError.fromZod(error);
      return ApiResponse.error(valError.message, valError.statusCode, valError.details);
    }

    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.details);
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return ApiResponse.error(message, 500);
  }
}
