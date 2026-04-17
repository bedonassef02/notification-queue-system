import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),
  DIRECT_URL: z.string().url('Invalid DIRECT_URL format').optional(),
  UPSTASH_REDIS_URL: z.string().url('Invalid UPSTASH_REDIS_URL format'),
  ZEPTOMAIL_API_KEY: z.string().min(1, 'ZEPTOMAIL_API_KEY is required'),
  ZEPTOMAIL_SENDER: z.string().email('Invalid ZEPTOMAIL_SENDER format'),
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_PHONE_NUMBER: z.string().min(1, 'TWILIO_PHONE_NUMBER is required'),
  ONESIGNAL_APP_ID: z.string().min(1, 'ONESIGNAL_APP_ID is required'),
  ONESIGNAL_API_KEY: z.string().min(1, 'ONESIGNAL_API_KEY is required'),
  ONESIGNAL_USER_AUTH_KEY: z.string().min(1, 'ONESIGNAL_USER_AUTH_KEY is required'),
  EMAIL_MAX_LIMIT: z.string().default('10'),
  SMS_MAX_LIMIT: z.string().default('2'),
  PUSH_MAX_LIMIT: z.string().default('50'),
  EMAIL_CONCURRENCY: z.string().default('5'),
  SMS_CONCURRENCY: z.string().default('2'),
  PUSH_CONCURRENCY: z.string().default('10')
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      throw new Error('Environment validation failed')
    }
    throw error
  }
}

export const env = validateEnv()