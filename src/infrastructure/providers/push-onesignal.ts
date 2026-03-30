// src/infrastructure/providers/push-onesignal.ts
import { INotificationProvider, ProviderResponse } from '@/domain/repositories/notification-provider';
import { NotificationType } from '@/domain/entities/notification';
import * as OneSignal from 'onesignal-node';

export class OneSignalProvider implements INotificationProvider {
  type = NotificationType.PUSH;
  private client: OneSignal.Client;

  constructor() {
    this.client = new OneSignal.Client(
      process.env.ONESIGNAL_APP_ID || '',
      process.env.ONESIGNAL_REST_API_KEY || ''
    );
  }

  async send(recipient: string, payload: any): Promise<ProviderResponse> {
    try {
      const response: any = await this.client.createNotification({
        contents: {
          en: payload.message || payload.body || '',
        },
        include_player_ids: [recipient], // assuming recipient is a push token
        headings: {
          en: payload.title || 'New Notification',
        },
      });

      return {
        success: true,
        externalId: response.id,
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
