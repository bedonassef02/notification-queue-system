// src/infrastructure/providers/factory.ts
import { NotificationType } from '@/domain/entities/notification';
import { INotificationProvider } from '@/domain/repositories/notification-provider';
import { ZeptoMailProvider } from './email-zeptomail';
import { TwilioProvider } from './sms-twilio';
import { OneSignalProvider } from './push-onesignal';

export class NotificationProviderFactory {
  private static providers: Map<NotificationType, INotificationProvider> = new Map();

  static getProvider(type: NotificationType): INotificationProvider {
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }

    let provider: INotificationProvider;

    switch (type) {
      case NotificationType.EMAIL:
        provider = new ZeptoMailProvider();
        break;
      case NotificationType.SMS:
        provider = new TwilioProvider();
        break;
      case NotificationType.PUSH:
        provider = new OneSignalProvider();
        break;
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }

    this.providers.set(type, provider);
    return provider;
  }
}
