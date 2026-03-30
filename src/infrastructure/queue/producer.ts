// src/infrastructure/queue/producer.ts
import { z } from 'zod';
import { getQueueByType } from './instance';
import { NotificationType } from '@/domain/entities/notification';

/**
 * Standard Job data structure for ingestion.
 * Features a mandatory `id` field for exactly-once processing.
 */
export const JobInputSchema = z.object({
  id: z.string().min(1), // Unique key for idempotency (e.g., transactionId, userId)
  type: z.nativeEnum(NotificationType), // Routing key
  name: z.string().min(1), // Descriptive task name
  data: z.record(z.string(), z.any()), // Extra task-specific metadata
  delay: z.number().optional().default(0), // Scheduled delay in ms
  priority: z.number().optional().default(0), // BullMQ priority (lower is higher)
});

export type JobInput = z.infer<typeof JobInputSchema>;

/**
 * High-level producer function to enqueue jobs into provider-specific queues.
 * Handles:
 * 1. Routing to specialized EMAIL/SMS/PUSH queues.
 * 2. Deduplication via BullMQ jobId.
 * 3. Priority and Scheduled Delays.
 */
export async function enqueueJob(taskName: string, input: JobInput) {
  // 1. Validate payload structure
  const validatedInput = JobInputSchema.parse(input);
  
  // 2. Route to the correct queue based on notification type
  const queue = getQueueByType(validatedInput.type);

  // 3. Add to BullMQ with idempotency and scheduling options
  const job = await queue.add(
    taskName,
    validatedInput.data,
    {
      jobId: `job-${validatedInput.id}`, // Ensures BullMQ rejects duplicate IDs
      delay: validatedInput.delay,
      priority: validatedInput.priority,
    }
  );

  console.log(`[Queue] Job Enqueued: ID=${job.id}, Type=${taskName}, Priority=${validatedInput.priority}, Delay=${validatedInput.delay}ms`);

  return {
    id: job.id,
    name: job.name,
    timestamp: job.timestamp,
  };
}
