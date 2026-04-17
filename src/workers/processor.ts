import { Job } from 'bullmq'
import { NotificationRepository } from '@/infrastructure/database/notification-repository'
import { LoggingService } from '@/application/services/logging-service'
import {
  NotificationStatus,
  NotificationType
} from '@/domain/entities/notification'
import { NotificationProviderFactory } from '@/infrastructure/providers/factory'
import { NotificationJobDataSchema } from '@/shared/validators/job-validator'
import { validatePayload } from '@/shared/validators/payload-validator'
import { AppError } from '@/shared/errors/error-handler'
import { ZodError } from 'zod'

export class NotificationProcessor {
  private performanceMetrics: Map<string, { count: number; totalTime: number; avgTime: number }>
  private jobHistory: Map<string, number[]>

  constructor(
    private notificationRepository: NotificationRepository = new NotificationRepository(),
    private loggingService: LoggingService = new LoggingService()
  ) {
    this.performanceMetrics = new Map()
    this.jobHistory = new Map()
  }

  async process(job: Job) {
    let notificationId: string
    const jobStartTime = Date.now()

    try {
      const validatedJob = NotificationJobDataSchema.parse(job.data)
      notificationId = validatedJob.notificationId

      this.recordJobStart(job.id, jobStartTime)

      const notification = await this.notificationRepository.findById(notificationId)

      if (!notification) {
        throw new AppError(
          `Notification ${notificationId} not found in database`,
          404,
          'NOT_FOUND'
        )
      }

      if (notification.status === NotificationStatus.SENT) {
        console.log(`[Worker] Idempotency: ${notificationId} already SENT. Skipping.`)
        this.recordJobComplete(job.id, Date.now() - jobStartTime)
        return
      }

      try {
        validatePayload(
          notification.type as NotificationType,
          notification.payload
        )
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors: Record<string, string[]> = {}
          error.issues.forEach((issue) => {
            const path = issue.path.join('.') || 'general'
            if (!formattedErrors[path]) {
              formattedErrors[path] = []
            }
            formattedErrors[path].push(issue.message)
          })

          throw new AppError('Payload validation failed', 400, 'VALIDATION_ERROR', formattedErrors)
        }
        throw error
      }

      const updated = await this.notificationRepository.updateStatus(
        notificationId,
        NotificationStatus.PROCESSING
      )
      await this.loggingService.logAttempt(
        notificationId,
        NotificationStatus.PROCESSING,
        updated.attempts
      )

      const provider = NotificationProviderFactory.getProvider(
        notification.type as unknown as NotificationType
      )

      const response = await provider.send(
        notification.recipient,
        notification.payload
      )

      if (response.success) {
        const finalUpdate = await this.notificationRepository.updateStatus(
          notificationId,
          NotificationStatus.SENT,
          1
        )
        await this.loggingService.logAttempt(
          notificationId,
          NotificationStatus.SENT,
          finalUpdate.attempts,
          undefined,
          response.metadata
        )
        console.log(`[Worker] Successfully delivery: ${notificationId}`)
      } else {
        await this.handleFailure(
          job,
          notificationId,
          response.error || 'Provider rejected',
          response.metadata
        )
      }
    } catch (err: any) {
      const message =
        err instanceof AppError
          ? err.message
          : `System Failure: ${err.message}`
      await this.handleFailure(job, notificationId, message, {
        originalError: err
      })
      throw err
    } finally {
      const jobDuration = Date.now() - jobStartTime
      this.recordJobComplete(job.id, jobDuration)
    }
  }

  private async handleFailure(
    job: Job,
    notificationId: string,
    error: string,
    metadata?: any
  ): Promise<void> {
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts?.attempts || 1)
    const finalStatus = isLastAttempt
      ? NotificationStatus.PERMANENT_FAILURE
      : NotificationStatus.FAILED

    const updated = await this.notificationRepository.updateStatus(
      notificationId,
      finalStatus,
      1
    )
    await this.loggingService.logAttempt(
      notificationId,
      finalStatus,
      updated.attempts,
      error,
      metadata
    )

    if (isLastAttempt) {
      console.error(`[Worker] PERMANENT_FAILURE: ${notificationId} | ${error}`)
    } else {
      console.warn(
        `[Worker] Retry Failure: ${notificationId} | attempt ${job.attemptsMade + 1} | ${error}`
      )
    }
  }

  private recordJobStart(jobId: string, startTime: number): void {
    const history = this.jobHistory.get(jobId) || []
    history.push(startTime)
    this.jobHistory.set(jobId, history)
  }

  private recordJobComplete(jobId: string, duration: number): void {
    const history = this.jobHistory.get(jobId) || []
    if (history.length > 0) {
      const startTime = history[0]
      history.push(Date.now())
    }

    this.updatePerformanceMetrics(jobId, duration)
  }

  private recordJobError(jobId: string, error: any): void {
    const history = this.jobHistory.get(jobId) || []
    if (history.length > 0) {
      const startTime = history[0]
      const duration = Date.now() - startTime
      history.push(Date.now())

      this.updatePerformanceMetrics(jobId, duration)
    }
  }

  private updatePerformanceMetrics(jobId: string, duration: number): void {
    const metrics = this.performanceMetrics.get(jobId) || {
      count: 0,
      totalTime: 0,
      avgTime: 0
    }
    metrics.count++
    metrics.totalTime += duration
    metrics.avgTime = metrics.totalTime / metrics.count

    this.performanceMetrics.set(jobId, metrics)

    if (metrics.count % 10 === 0) {
      console.info(`Performance metrics for job ${jobId}`, metrics)
    }
  }

  getPerformanceMetrics(): { [key: string]: typeof this.performanceMetrics.get('0') } {
    const result: any = {}
    for (const [key, value] of this.performanceMetrics.entries()) {
      result[key] = value
    }
    return result
  }

  clearJobHistory(): void {
    this.jobHistory.clear()
  }
}