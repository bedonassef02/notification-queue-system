// src/workers/main-worker.ts
import { Worker, Job } from "bullmq";
import { getConnection, closeConnection } from "@/infrastructure/queue/connection";
import { QUEUE_NAMES } from "@/infrastructure/queue/instance";
import { NotificationProcessor } from "./processor";
import { NotificationType } from "@/domain/entities/notification";
import { env } from "@/shared/validators/env-validator";
import { logger } from "@/shared/utils/logger";

const processor = new NotificationProcessor()

const WORKER_CONFIGS: Record<
  NotificationType,
  { concurrency: number; maxJobs: number; duration: number }
> = {
  [NotificationType.EMAIL]: {
    concurrency: parseInt(env.EMAIL_CONCURRENCY),
    maxJobs: parseInt(env.EMAIL_MAX_LIMIT),
    duration: 1000
  },
  [NotificationType.SMS]: {
    concurrency: parseInt(env.SMS_CONCURRENCY),
    maxJobs: parseInt(env.SMS_MAX_LIMIT),
    duration: 1000
  },
  [NotificationType.PUSH]: {
    concurrency: parseInt(env.PUSH_CONCURRENCY),
    maxJobs: parseInt(env.PUSH_MAX_LIMIT),
    duration: 1000
  },
}

console.log("Initializing Notification Workers...");

const workers: Worker[] = [];
let isShuttingDown = false;

Object.entries(QUEUE_NAMES).forEach(([type, queueName]) => {
  const config = WORKER_CONFIGS[type as NotificationType];

  const worker = new Worker(
    queueName,
    async (job: Job) => {
      if (isShuttingDown) {
        logger.info(`Worker shutting down, skipping job ${job.id}`)
        return
      }

      await logger.trackPerformance(
        `Worker.process(${type})`,
        async () => processor.process(job)
      )
    },
    {
      connection: getConnection(),
      lockDuration: 60000,
      concurrency: config.concurrency,
      limiter: {
        max: config.maxJobs,
        duration: config.duration
      }
    }
  );

  worker.on("completed", (job) => {
    logger.info(`[${type}] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[${type}] Job ${job.id} failed with ${err.message}`);
  });

  worker.on("error", (err) => {
    logger.error(`[${type}] Worker error`, err);
  });

  workers.push(worker);

  logger.info(
    `[Worker] Started for ${type} (Queue: ${queueName}) with concurrency ${config.concurrency} and rate limit ${config.maxJobs}/${config.duration}ms`,
  );
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  isShuttingDown = true

  logger.info('Waiting for active jobs to complete...')

  await Promise.all(
    workers.map(async (worker) => {
      const waitingStart = Date.now()
      while (isShuttingDown && await worker.getActiveCount() > 0) {
        if (Date.now() - waitingStart > 30000) {
          logger.warn('Graceful shutdown timeout, forcing worker close')
          break
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    })
  )

  logger.info('All workers completed active jobs, closing connections...')

  await Promise.all(workers.map(w => w.close()))

  await closeConnection()

  processor.clearJobHistory()

  logger.info('All workers and connections closed successfully')

  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  gracefulShutdown('uncaughtException')
})
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})

console.log("All Notification Workers are active!");
