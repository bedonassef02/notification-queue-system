import { NotificationService } from "@/application/services/notification-service";
import { ApiResponse } from "@/shared/utils/api-response";
import { handleApiError } from "@/shared/utils/error-handler";

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
    return handleApiError(error);
  }
}
