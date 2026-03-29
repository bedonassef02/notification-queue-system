import { NotificationService } from '@/application/services/notification-service';
import { ApiResponse } from '@/shared/utils/api-response';
import { ZodError } from 'zod';

const notificationService = new NotificationService();

export async function POST(req: Request) {
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
      return ApiResponse.validationError(error);
    }

    return ApiResponse.error(
      (error as Error).message || 'Internal Server Error',
      500
    );
  }
}
