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

process.on('SIGTERM', async () => {
    console.log('Shutting down worker...');
    await worker.close();
});

console.log('Notification Worker is running!');
