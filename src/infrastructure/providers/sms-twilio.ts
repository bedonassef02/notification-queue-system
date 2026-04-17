// src/infrastructure/providers/sms-twilio.ts
import {
  INotificationProvider,
  ProviderResponse,
} from "@/domain/repositories/notification-provider";
import { NotificationType } from "@/domain/entities/notification";
import { SMSPayload } from "@/domain/entities/payloads";
import { env } from "@/shared/validators/env-validator";
import { AppError } from "@/shared/errors/error-handler";
import twilio from "twilio";

export class TwilioProvider implements INotificationProvider {
  type = NotificationType.SMS;
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_AUTH_TOKEN,
    );
  }

  async send(
    recipient: string,
    payload: SMSPayload,
  ): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.messages.create({
        to: recipient,
        from: env.TWILIO_PHONE_NUMBER,
        body: payload.message || "",
      });

      return {
        success: true,
        externalId: response.sid,
        metadata: response,
      };
    } catch (error: any) {
      throw new AppError(
        `Twilio delivery failed: ${error.message}`,
        502,
        'PROVIDER_ERROR'
      );
    }
  }
}
