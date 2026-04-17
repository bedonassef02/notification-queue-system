// src/infrastructure/providers/email-zeptomail.ts
import {
  INotificationProvider,
  ProviderResponse,
} from "@/domain/repositories/notification-provider";
import { NotificationType } from "@/domain/entities/notification";
import { EmailPayload } from "@/domain/entities/payloads";
import { env } from "@/shared/validators/env-validator";
import { AppError } from "@/shared/errors/error-handler";
import { SendMailClient } from "zeptomail";

export class ZeptoMailProvider implements INotificationProvider {
  type = NotificationType.EMAIL;
  private client: SendMailClient;

  constructor() {
    this.client = new SendMailClient({
      url: "https://api.zeptomail.com/",
      token: env.ZEPTOMAIL_API_KEY,
    });
  }

  async send(
    recipient: string,
    payload: EmailPayload,
  ): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.sendMail({
        from: {
          address: env.ZEPTOMAIL_SENDER,
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
      throw new AppError(
        `ZeptoMail delivery failed: ${error.message}`,
        502,
        'PROVIDER_ERROR'
      );
    }
  }
}
