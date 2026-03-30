// src/infrastructure/providers/email-zeptomail.ts
import {
  INotificationProvider,
  ProviderResponse,
} from "@/domain/repositories/notification-provider";
import { NotificationType } from "@/domain/entities/notification";
import { EmailPayload } from "@/domain/entities/payloads";
import { AppConfig, AppConfigType } from "@/shared/utils/config";
import { InfrastructureError } from "@/shared/utils/application-error";
import { SendMailClient } from "zeptomail";

export class ZeptoMailProvider implements INotificationProvider {
  type = NotificationType.EMAIL;
  private client: SendMailClient;
  private config: AppConfigType;

  constructor(config: AppConfigType = AppConfig) {
    this.config = config;
    this.client = new SendMailClient({
      url: "https://api.zeptomail.com/",
      token: this.config.ZEPTOMAIL_API_KEY,
    });
  }

  async send(
    recipient: string,
    payload: EmailPayload,
  ): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.sendMail({
        from: {
          address: this.config.ZEPTOMAIL_SENDER_EMAIL,
          name: "Notifications",
        },
        to: [{ email_address: { address: recipient, name: recipient } }],
        subject: payload.subject || "New Notification",
        htmlbody: payload.htmlBody || payload.body || "",
      });

      return {
        success: true,
        externalId: response.data?.[0]?.request_id,
        metadata: response,
      };
    } catch (error: any) {
      throw new InfrastructureError(
        `ZeptoMail delivery failed: ${error.message}`,
        error,
      );
    }
  }
}
