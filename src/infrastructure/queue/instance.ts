// src/infrastructure/queue/instance.ts
import { Queue } from "bullmq";
import { getConnection } from "./connection";
import { NotificationType } from "@/domain/entities/notification";

export const QUEUE_NAMES = {
  [NotificationType.EMAIL]: "email-queue",
  [NotificationType.SMS]: "sms-queue",
  [NotificationType.PUSH]: "push-queue",
};

const queues: Partial<Record<NotificationType, Queue>> = {};

/**
 * Retrieves the specific BullMQ Queue instance for a notification type.
 * Each queue is a singleton to ensure connection reuse.
 */
export const getQueueByType = (type: NotificationType): Queue => {
  const name = QUEUE_NAMES[type];

  if (!queues[type]) {
    queues[type] = new Queue(name, {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 10000, // 10s, 20s, 40s...
        },
        removeOnComplete: true,
      },
    });

    console.log(`BullMQ Queue [${name}] initialized.`);
  }

  return queues[type] as Queue;
};

/**
 * @deprecated Use getQueueByType instead.
 * Kept for backward compatibility during transition.
 */
export const getQueue = (): Queue => {
  return getQueueByType(NotificationType.EMAIL);
};
