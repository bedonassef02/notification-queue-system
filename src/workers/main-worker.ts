// src/workers/main-worker.ts
import { Worker, Job } from 'bullmq';
import { getConnection } from '@/infrastructure/queue/connection';
import { QUEUE_NAMES } from '@/infrastructure/queue/instance';
import { NotificationProcessor } from './processor';
import { NotificationType } from '@/domain/entities/notification';
import { AppConfig } from '@/shared/utils/config';

const processor = new NotificationProcessor();

/**
 * Worker Configuration
 * Defines rate limits and concurrency for each provider type.
 */
const WORKER_CONFIGS: Record<NotificationType, { concurrency: number; maxJobs: number; duration: number }> = {
  [NotificationType.EMAIL]: {
    concurrency: AppConfig.EMAIL_CONCURRENCY,
    maxJobs: AppConfig.EMAIL_MAX_LIMIT,
    duration: 1000,
  },
  [NotificationType.SMS]: {
    concurrency: AppConfig.SMS_CONCURRENCY,
    maxJobs: AppConfig.SMS_MAX_LIMIT,
    duration: 1000,
  },
  [NotificationType.PUSH]: {
    concurrency: AppConfig.PUSH_CONCURRENCY,
    maxJobs: AppConfig.PUSH_MAX_LIMIT,
    duration: 1000,
  },
};

console.log('Initializing Notification Workers...');

const workers: Worker[] = [];

// Start a separate worker for each provider queue
Object.entries(QUEUE_NAMES).forEach(([type, queueName]) => {
  const config = WORKER_CONFIGS[type as NotificationType];

  const worker = new Worker(
    queueName,
    async (job: Job) => {
      await processor.process(job);
    },
    {
      connection: getConnection(),
      lockDuration: 60000, // 60s
      concurrency: config.concurrency,
      limiter: {
        max: config.maxJobs,
        duration: config.duration,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[${type}] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[${type}] Job ${job?.id} failed with ${err.message}`);
  });

  workers.push(worker);
  console.log(`[Worker] Started for ${type} (Queue: ${queueName}) with concurrency ${config.concurrency} and rate limit ${config.maxJobs}/${config.duration}ms`);
});

/**
 * Graceful shutdown for all workers
 */
const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down all workers gracefully...`);
  await Promise.all(workers.map(w => w.close()));
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

console.log('All Notification Workers are active!');
