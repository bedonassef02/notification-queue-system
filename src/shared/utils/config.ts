// src/shared/utils/config.ts
import { z } from 'zod';

/**
 * Global Configuration Schema
 * Validates all required environment variables at runtime.
 * If any production secret is missing, the application will fail-fast with a clear error.
 */
const ConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  UPSTASH_REDIS_URL: z.string().url(),
  
  // Rate Limits & Concurrency
  EMAIL_MAX_LIMIT: z.coerce.number().default(10),
  SMS_MAX_LIMIT: z.coerce.number().default(2),
  PUSH_MAX_LIMIT: z.coerce.number().default(50),
  EMAIL_CONCURRENCY: z.coerce.number().default(5),
  SMS_CONCURRENCY: z.coerce.number().default(2),
  PUSH_CONCURRENCY: z.coerce.number().default(10),

  // Provider Credentials
  ZEPTOMAIL_API_KEY: z.string().min(1),
  ZEPTOMAIL_SENDER_EMAIL: z.string().email(),
  
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  
  ONESIGNAL_APP_ID: z.string().min(1),
  ONESIGNAL_REST_API_KEY: z.string().min(1),
});

export type AppConfigType = z.infer<typeof ConfigSchema>;

/**
 * Singleton instance of the application configuration.
 * Always import this instead of accessing process.env directly.
 */
export const AppConfig = ConfigSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
  
  EMAIL_MAX_LIMIT: process.env.EMAIL_MAX_LIMIT,
  SMS_MAX_LIMIT: process.env.SMS_MAX_LIMIT,
  PUSH_MAX_LIMIT: process.env.PUSH_MAX_LIMIT,
  EMAIL_CONCURRENCY: process.env.EMAIL_CONCURRENCY,
  SMS_CONCURRENCY: process.env.SMS_CONCURRENCY,
  PUSH_CONCURRENCY: process.env.PUSH_CONCURRENCY,

  ZEPTOMAIL_API_KEY: process.env.ZEPTOMAIL_API_KEY,
  ZEPTOMAIL_SENDER_EMAIL: process.env.ZEPTOMAIL_SENDER_EMAIL,
  
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
  ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY,
});
