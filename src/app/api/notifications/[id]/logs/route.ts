import { NotificationService } from "@/application/services/notification-service";
import { ApiResponse } from "@/shared/utils/api-response";
import { NotFoundError } from "@/shared/errors/error-handler";
import { handleApiError } from "@/shared/utils/error-handler";
import { NextRequest } from "next/server";

/**
 * GET /api/notifications/[id]/logs
 * Retrieves full audit log history for a specific notification delivery.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const notificationService = new NotificationService();

  try {
    const { id: notificationId } = await context.params;

    // 1. Fetch notification and logs via Service
    const notification = await notificationService.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notification", notificationId);
    }

    // 2. Fetch full delivery history
    const logs = await notificationService.getLogs(notificationId);

    return ApiResponse.success({
      id: notification.id,
      type: notification.type,
      status: notification.status,
      attempts: notification.attempts,
      logs: logs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
