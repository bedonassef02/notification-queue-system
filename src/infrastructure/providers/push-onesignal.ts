// src/infrastructure/providers/push-onesignal.ts
import {
  INotificationProvider,
  ProviderResponse,
} from "@/domain/repositories/notification-provider";
import { NotificationType } from "@/domain/entities/notification";
import { PushPayload } from "@/domain/entities/payloads";
import { env } from "@/shared/validators/env-validator";
import { AppError } from "@/shared/errors/error-handler";
import * as OneSignal from "onesignal-node";

export class OneSignalProvider implements INotificationProvider {
  type = NotificationType.PUSH;
  private client: OneSignal.Client;

  constructor() {
    this.client = new OneSignal.Client(
      env.ONESIGNAL_APP_ID,
      env.ONESIGNAL_API_KEY,
    );
  }

  async send(
    recipient: string,
    payload: PushPayload,
  ): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.createNotification({
        contents: {
          en: payload.body || "",
        },
        include_player_ids: [recipient],
        headings: {
          en: payload.title || "New Notification",
        },
        big_picture: payload.imageUrl,
        data: payload.data,
      });

      return {
        success: true,
        externalId: response.id,
        metadata: response,
      };
    } catch (error: any) {
      throw new AppError(
        `OneSignal delivery failed: ${error.message}`,
        502,
        'PROVIDER_ERROR'
      );
    }
  }
}
