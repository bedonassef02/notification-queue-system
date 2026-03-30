// src/infrastructure/providers/sms-twilio.ts
import {
  INotificationProvider,
  ProviderResponse,
} from "@/domain/repositories/notification-provider";
import { NotificationType } from "@/domain/entities/notification";
import { SMSPayload } from "@/domain/entities/payloads";
import { AppConfig, AppConfigType } from "@/shared/utils/config";
import { InfrastructureError } from "@/shared/utils/application-error";
import twilio from "twilio";

export class TwilioProvider implements INotificationProvider {
  type = NotificationType.SMS;
  private client: twilio.Twilio;
  private config: AppConfigType;

  constructor(config: AppConfigType = AppConfig) {
    this.config = config;
    this.client = twilio(
      this.config.TWILIO_ACCOUNT_SID,
      this.config.TWILIO_AUTH_TOKEN,
    );
  }

  async send(
    recipient: string,
    payload: SMSPayload,
  ): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.messages.create({
        to: recipient,
        from: this.config.TWILIO_PHONE_NUMBER,
        body: payload.message || "",
      });

      return {
        success: true,
        externalId: response.sid,
        metadata: response,
      };
    } catch (error: any) {
      throw new InfrastructureError(
        `Twilio delivery failed: ${error.message}`,
        error,
      );
    }
  }
}
