// src/infrastructure/providers/sms-twilio.ts
import { INotificationProvider, ProviderResponse } from '@/domain/repositories/notification-provider';
import { NotificationType } from '@/domain/entities/notification';
import twilio from 'twilio';

export class TwilioProvider implements INotificationProvider {
  type = NotificationType.SMS;
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID || '',
      process.env.TWILIO_AUTH_TOKEN || ''
    );
  }

  async send(recipient: string, payload: any): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.messages.create({
        to: recipient,
        from: process.env.TWILIO_PHONE_NUMBER || '',
        body: payload.message || payload.body || '',
      });

      return {
        success: true,
        externalId: response.sid,
        metadata: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        metadata: error,
      };
    }
  }
}
