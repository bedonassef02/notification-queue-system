// src/shared/validators/job-validator.ts
import { z } from 'zod';

/**
 * Standard Job data structure for ingestion.
 * Features a mandatory `id` field for exactly-once processing.
 */
export const JobInputSchema = z.object({
  id: z.string().min(1),             // Unique key for idempotency (e.g., notification UUID)
  name: z.string().min(1),           // Descriptive task name (e.g., 'send-notification')
  data: z.object({
    notificationId: z.string().uuid(), // Reference to the actual Notification record in DB
  }).passthrough(),                   // Allow extra metadata if needed
});

export type JobInput = z.infer<typeof JobInputSchema>;

/**
 * Schema for the actual BullMQ Job data (what's inside job.data)
 */
export const NotificationJobDataSchema = z.object({
  notificationId: z.string().uuid(),
});

export type NotificationJobData = z.infer<typeof NotificationJobDataSchema>;
