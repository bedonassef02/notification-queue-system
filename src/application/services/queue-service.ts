// src/application/services/queue-service.ts
import { Queue } from 'bullmq'
import { getConnection } from '@/infrastructure/queue/connection'
import { NotificationType } from '@/domain/entities/notification'
import { getQueueByType } from '@/infrastructure/queue/instance'
import { logger } from '@/shared/utils/logger'

export interface QueueJobData {
  notificationId: string
}

export interface QueueJobOptions {
  delay?: number
  priority?: number
  attempts?: number
  backoff?: {
    type: 'exponential' | 'fixed'
    delay: number
  }
}

export class QueueService {
  private queues: Map<NotificationType, Queue>

  constructor() {
    this.queues = new Map()
  }

  getQueue(type: NotificationType): Queue {
    if (!this.queues.has(type)) {
      this.queues.set(type, getQueueByType(type))
    }
    return this.queues.get(type)!
  }

  async enqueue(
    type: NotificationType,
    jobName: string,
    data: QueueJobData,
    options?: QueueJobOptions
  ): Promise<{ id: string; name: string }> {
    const queue = this.getQueue(type)

    return await logger.trackPerformance(
      `QueueService.enqueue(${type})`,
      async () => {
        const job = await queue.add(jobName, data, {
          jobId: `notification-${data.notificationId}`,
          delay: options?.delay || 0,
          priority: options?.priority || 0,
          attempts: options?.attempts || 3,
          backoff: options?.backoff || {
            type: 'exponential',
            delay: 1000
          }
        })

        const jobId = job.id || 'unknown'

        logger.info(`Job enqueued successfully`, {
          jobId,
          jobName,
          notificationType: type,
          notificationId: data.notificationId,
          options
        })

        return {
          id: jobId,
          name: job.name || jobName
        }
      }
    )
  }

  async getJobCount(type: NotificationType): Promise<number> {
    const queue = this.getQueue(type)
    return await queue.getJobCounts('waiting', 'active', 'delayed').then(
      counts => counts.waiting + counts.active + counts.delayed
    )
  }

  async clearQueue(type: NotificationType): Promise<void> {
    const queue = this.getQueue(type)
    await queue.drain()
    logger.info(`Queue cleared for type ${type}`)
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map(queue => queue.close())
    await Promise.all(closePromises)
    logger.info('All queue connections closed')
  }

  getQueueNames(): NotificationType[] {
    return Array.from(this.queues.keys())
  }
}

export const queueService = new QueueService()