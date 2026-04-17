import { NotificationService } from "@/application/services/notification-service";
import { ApiResponse } from "@/shared/utils/api-response";
import { handleApiError } from "@/shared/utils/error-handler";
import { ZodError } from "zod";

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
      "Notification enqueued successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}
