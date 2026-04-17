// src/application/services/notification-service.ts
import { NotificationRepository } from '@/infrastructure/database/notification-repository'
import { LogRepository } from '@/infrastructure/database/log-repository'
import { enqueueJob } from '@/infrastructure/queue/producer'
import {
  NotificationType,
  NotificationStatus
} from '@/domain/entities/notification'
import {
  EnqueueNotificationSchema,
  EnqueueNotificationInput
} from '@/shared/validators/notification-validator'
import { LoggingService } from './logging-service'
import { RedisCache } from '@/infrastructure/queue/cache'

export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository = new NotificationRepository(),
    private loggingService: LoggingService = new LoggingService()
  ) {}

  async create(input: EnqueueNotificationInput) {
    const validatedInput = EnqueueNotificationSchema.parse(input)

    const cacheKey = RedisCache.generateKey('notification', validatedInput.idempotencyKey || validatedInput.recipient)

    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      console.log(`[Cache] Notification found in cache: ${cacheKey}`)
      return cached
    }

    const createInput = {
      type: validatedInput.type as NotificationType,
      recipient: validatedInput.recipient,
      payload: validatedInput.payload,
      idempotencyKey: validatedInput.idempotencyKey || undefined,
      priority: validatedInput.priority as any,
      scheduledAt: validatedInput.scheduledAt ? new Date(validatedInput.scheduledAt) : undefined
    }

    const existing = validatedInput.idempotencyKey
      ? await this.notificationRepository.findByIdempotencyKey(validatedInput.idempotencyKey)
      : null

    let notification
    if (existing) {
      notification = existing
    } else {
      notification = await this.notificationRepository.create(createInput)
    }

    await RedisCache.set(cacheKey, notification, { ttl: 300 })

    if (notification.status === NotificationStatus.SENT) {
      console.log(`[Idempotency] Notification ${notification.id} already SENT. Skipping enqueue.`)
      return notification
    }

    if (notification.status === NotificationStatus.PENDING) {
      const scheduledAt = createInput.scheduledAt
      const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0

      await enqueueJob('send-notification', {
        id: notification.id,
        type: notification.type as unknown as NotificationType,
        name: `Notification-${notification.type as string}-${notification.id}`,
        data: { notificationId: notification.id },
        priority: notification.priority,
        delay: delay
      })
    }

    return notification
  }

  async findAll() {
    const cacheKey = RedisCache.generateKey('notifications', 'pending')

    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const notifications = await this.notificationRepository.findByStatus(NotificationStatus.PENDING)
    await RedisCache.set(cacheKey, notifications, { ttl: 300 })

    return notifications
  }

  async findById(id: string) {
    const cacheKey = RedisCache.generateKey('notification', id)

    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const notification = await this.notificationRepository.findById(id)
    if (notification) {
      await RedisCache.set(cacheKey, notification, { ttl: 300 })
    }

    return notification
  }

  async getLogs(notificationId: string) {
    const cacheKey = RedisCache.generateKey('logs', notificationId)

    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const logs = await this.loggingService.getHistory(notificationId)
    await RedisCache.set(cacheKey, logs, { ttl: 60 })

    return logs
  }

  async getDeadLetters() {
    const cacheKey = RedisCache.generateKey('notifications', 'dlq')

    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const deadLetters = await this.loggingService.getDeadLetters()
    await RedisCache.set(cacheKey, deadLetters, { ttl: 60 })

    return deadLetters
  }
}