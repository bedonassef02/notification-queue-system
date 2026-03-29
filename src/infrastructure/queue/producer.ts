// src/infrastructure/queue/producer.ts
import { z } from 'zod';
import { getQueue } from './instance';

/**
 * Standard Job data structure for ingestion.
 * Features a mandatory `id` field for exactly-once processing.
 */
export const JobInputSchema = z.object({
  id: z.string().min(1), // Unique key for idempotency (e.g., transactionId, userId)
  name: z.string().min(1), // Descriptive task name
  data: z.record(z.string(), z.any()), // Extra task-specific metadata
});

export type JobInput = z.infer<typeof JobInputSchema>;

/**
 * High-level producer function to enqueue jobs into the primary queue.
 * Automatically handles deduplication by mapping input.id to BullMQ's jobId.
 */
export async function enqueueJob(taskName: string, input: JobInput) {
  // 1. Validate payload structure
  const validatedInput = JobInputSchema.parse(input);
  
  const queue = getQueue();

  // 2. Add to BullMQ with custom jobId for idempotency
  const job = await queue.add(
    taskName,
    validatedInput.data,
    {
      jobId: `job-${validatedInput.id}`, // Ensures BullMQ rejects duplicate IDs
    }
  );

  console.log(`[Queue] Job Enqueued: ID=${job.id}, Type=${taskName}`);

  return {
    id: job.id,
    name: job.name,
    timestamp: job.timestamp,
  };
}
