// src/domain/entities/payloads.ts

/**
 * Definition of specific payloads for each notification channel.
 * This replaces 'any' and ensures consistent data structure.
 */

export interface EmailPayload {
  subject: string;
  htmlBody?: string;
  body?: string;
  fromName?: string;
}

export interface SMSPayload {
  message: string;
}

export interface PushPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
}

/**
 * Union type representing any supported notification payload.
 */
export type NotificationPayload = EmailPayload | SMSPayload | PushPayload;
