// src/infrastructure/queue/producer.ts
import { z } from 'zod'
import { getQueueByType } from './instance'
import { NotificationType } from '@/domain/entities/notification'
import { logger } from '@/shared/utils/logger'

const rateLimiterMap = new Map<NotificationType, { count: number; resetTime: number }>()

const MAX_REQUESTS_PER_MINUTE: Record<NotificationType, number> = {
  [NotificationType.EMAIL]: 10,
  [NotificationType.SMS]: 2,
  [NotificationType.PUSH]: 50
}

const RATE_LIMIT_WINDOW = 60000 // 1 minute in milliseconds

function checkRateLimit(type: NotificationType): boolean {
  const now = Date.now()
  const limiter = rateLimiterMap.get(type) || { count: 0, resetTime: now - RATE_LIMIT_WINDOW }

  if (now > limiter.resetTime) {
    limiter.count = 0
    limiter.resetTime = now
  }

  if (limiter.count >= MAX_REQUESTS_PER_MINUTE[type]) {
    const waitTime = limiter.resetTime - now
    logger.warn(`Rate limit exceeded for ${type}, must wait ${waitTime}ms`)
    return false
  }

  limiter.count++
  rateLimiterMap.set(type, limiter)
  return true
}

export const JobInputSchema = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  name: z.string().min(1),
  data: z.record(z.string(), z.any()),
  delay: z.number().optional().default(0),
  priority: z.number().optional().default(0)
})

export type JobInput = z.input<typeof JobInputSchema>

export async function enqueueJob(taskName: string, input: JobInput) {
  const startTime = Date.now()

  try {
    const validatedInput = JobInputSchema.parse(input)

    if (!checkRateLimit(validatedInput.type)) {
      throw new Error(`Rate limit exceeded for ${validatedInput.type}`)
    }

    const queue = getQueueByType(validatedInput.type)

    const job = await logger.trackPerformance(
      `Producer.enqueue(${validatedInput.type})`,
      async () => {
        const result = await queue.add(taskName, validatedInput.data, {
          jobId: `job-${validatedInput.id}`,
          delay: validatedInput.delay,
          priority: validatedInput.priority,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          }
        })

        return result
      }
    )

    const duration = Date.now() - startTime

    logger.info(`Job enqueued successfully`, {
      jobId: job.id,
      jobName,
      notificationType: validatedInput.type,
      priority: validatedInput.priority,
      delay: validatedInput.delay,
      duration
    })

    return {
      id: job.id,
      name: job.name,
      timestamp: job.timestamp,
      duration
    }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(`Job enqueue failed`, error, { duration })
    throw error
  }
}