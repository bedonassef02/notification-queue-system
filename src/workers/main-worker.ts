// src/workers/main-worker.ts
import { Worker } from 'bullmq';
import { getConnection } from '@/infrastructure/queue/connection';
import { JOB_QUEUE_NAME } from '@/infrastructure/queue/instance';
import { NotificationProcessor } from './processor';

const processor = new NotificationProcessor();

console.log('Starting Notification Worker...');

const worker = new Worker(
  JOB_QUEUE_NAME,
  async (job) => {
    await processor.process(job);
  },
  { 
    connection: getConnection(),
    lockDuration: 60000, // 60s
    concurrency: 5,     // process 5 jobs at a time
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed with ${err.message}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down worker gracefully...`);
    await worker.close();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

console.log('Notification Worker is running!');
