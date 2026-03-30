// src/infrastructure/providers/push-onesignal.ts
import {
  INotificationProvider,
  ProviderResponse,
} from "@/domain/repositories/notification-provider";
import { NotificationType } from "@/domain/entities/notification";
import { PushPayload } from "@/domain/entities/payloads";
import { AppConfig, AppConfigType } from "@/shared/utils/config";
import { InfrastructureError } from "@/shared/utils/application-error";
import * as OneSignal from "onesignal-node";

export class OneSignalProvider implements INotificationProvider {
  type = NotificationType.PUSH;
  private client: OneSignal.Client;
  private config: AppConfigType;

  constructor(config: AppConfigType = AppConfig) {
    this.config = config;
    this.client = new OneSignal.Client(
      this.config.ONESIGNAL_APP_ID,
      this.config.ONESIGNAL_REST_API_KEY,
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
      throw new InfrastructureError(
        `OneSignal delivery failed: ${error.message}`,
        error,
      );
    }
  }
}
