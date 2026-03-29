// src/infrastructure/providers/email-zeptomail.ts
import { INotificationProvider, ProviderResponse } from '@/domain/repositories/notification-provider';
import { NotificationType } from '@prisma/client';
import { SendMailClient } from 'zeptomail';

export class ZeptoMailProvider implements INotificationProvider {
  type = NotificationType.EMAIL;
  private client: SendMailClient;

  constructor() {
    this.client = new SendMailClient({
      url: 'https://api.zeptomail.com/',
      token: process.env.ZEPTOMAIL_API_KEY || '',
    });
  }

  async send(recipient: string, payload: any): Promise<ProviderResponse> {
    try {
      const response = await this.client.sendMail({
        from: {
          address: process.env.ZEPTOMAIL_SENDER_EMAIL || '',
          name: 'Notifications',
        },
        to: [{ email_address: { address: recipient, name: recipient } }],
        subject: payload.subject || 'New Notification',
        htmlbody: payload.htmlBody || payload.body || '',
      });

      return {
        success: true,
        externalId: response.data?.[0]?.request_id,
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
