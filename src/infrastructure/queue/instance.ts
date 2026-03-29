// src/infrastructure/queue/instance.ts
import { Queue } from 'bullmq';
import { getConnection } from './connection';

export const JOB_QUEUE_NAME = 'main-job-queue';

/**
 * BullMQ Queue instance singleton.
 */
let queue: Queue | null = null;

export const getQueue = (): Queue => {
  if (!queue) {
    queue = new Queue(JOB_QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 10000, // 10s, 20s, 40s...
        },
        removeOnComplete: true,
      },
    });

    console.log(`BullMQ Queue [${JOB_QUEUE_NAME}] initialized.`);
  }
  return queue;
};
