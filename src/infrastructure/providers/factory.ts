// src/infrastructure/providers/factory.ts
import { NotificationType } from "@/domain/entities/notification";
import { INotificationProvider } from "@/domain/repositories/notification-provider";
import { ZeptoMailProvider } from "./email-zeptomail";
import { TwilioProvider } from "./sms-twilio";
import { OneSignalProvider } from "./push-onesignal";

/**
 * Notification Provider Factory
 * Implements a Manual Registry (DI) to manage provider instances.
 * Allows overriding providers for testing or specialized configuration.
 */
export class NotificationProviderFactory {
  private static providers: Map<NotificationType, INotificationProvider> =
    new Map();

  /**
   * Register a specific provider instance.
   */
  static register(
    type: NotificationType,
    provider: INotificationProvider,
  ): void {
    this.providers.set(type, provider);
  }

  /**
   * Retrieves a provider instance.
   * If not registered, it initializes the default implementation.
   */
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

    this.register(type, provider);
    return provider;
  }

  /**
   * Clear all registered providers (useful for test isolation).
   */
  static clear(): void {
    this.providers.clear();
  }
}
