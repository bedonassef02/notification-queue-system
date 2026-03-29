// src/domain/repositories/notification-provider.ts
import { NotificationType } from '@prisma/client';

export interface ProviderResponse {
  success: boolean;
  externalId?: string;
  error?: string;
  metadata?: any;
}

export interface INotificationProvider {
  type: NotificationType;
  send(recipient: string, payload: any): Promise<ProviderResponse>;
}
