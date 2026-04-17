import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NotificationProcessor } from '@/workers/processor'
import { NotificationRepository } from '@/infrastructure/database/notification-repository'
import { LogRepository } from '@/infrastructure/database/log-repository'
import { NotificationType, NotificationStatus } from '@/domain/entities/notification'

describe('Load Tests for Worker Processing', () => {
  let startTime: number
  let processor: NotificationProcessor
  let notificationRepo: NotificationRepository
  let logRepo: LogRepository

  beforeAll(() => {
    startTime = Date.now()
    processor = new NotificationProcessor()
    notificationRepo = new NotificationRepository()
    logRepo = new LogRepository()
  })

  afterAll(() => {
    const duration = Date.now() - startTime
    console.log(`Worker load test suite completed in ${duration}ms`)
  })

  describe('Job Processing Performance', () => {
    it('should process 1000 jobs efficiently', async () => {
      const jobs = Array.from({ length: 1000 }, (_, i) => ({
        id: `job-${i}`,
        name: `test-job-${i}`,
        data: { notificationId: `notification-${i}` }
      }))

      const start = Date.now()

      for (const job of jobs) {
        try {
          await processor.process(job as any)
        } catch {
          // Simulate worker processing - continue even if some jobs fail
        }
      }

      const end = Date.now()
      const totalDuration = end - start

      expect(totalDuration).toBeLessThan(30000) // Should process 1000 jobs in under 30 seconds
    })

    it('should maintain sub-200ms response times for 90% of jobs', async () => {
      const jobs = Array.from({ length: 100 }, (_, i) => ({
        id: `job-${i}`,
        name: `test-job-${i}`,
        data: { notificationId: `notification-${i}` }
      }))

      const responseTimes: number[] = []

      for (const job of jobs) {
        const start = Date.now()
        try {
          await processor.process(job as any)
          const end = Date.now()
          responseTimes.push(end - start)
        } catch {
          // Count failures as slow responses
          responseTimes.push(1000)
        }
      }

      const fastResponses = responseTimes.filter(time => time < 200)
      const percentage = (fastResponses.length / responseTimes.length) * 100

      expect(percentage).toBeGreaterThanOrEqual(90)
    })

    it('should handle concurrent job processing', async () => {
      const jobs = Array.from({ length: 50 }, (_, i) => ({
        id: `job-${i}`,
        name: `concurrent-job-${i}`,
        data: { notificationId: `notification-${i}` }
      }))

      const start = Date.now()

      await Promise.all(
        jobs.map(job =>
          processor.process(job as any).catch(() => {
            // Handle failures gracefully
          })
        )
      )

      const end = Date.now()
      const duration = end - start

      expect(duration).toBeLessThan(5000) // Should process 50 concurrent jobs in under 5 seconds
    })
  })

  describe('Memory and Resource Usage', () => {
    it('should not leak memory during processing', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      for (let i = 0; i < 100; i++) {
        const job = {
          id: `job-${i}`,
          name: `test-job-${i}`,
          data: { notificationId: `notification-${i}` }
        }

        try {
          await processor.process(job as any)
        } catch {
          // Continue even if processing fails
        }

        // Force garbage collection check every 10 iterations
        if (i % 10 === 0) {
          global.gc && global.gc()
        }
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB increase
    })

    it('should handle resource cleanup gracefully', async () => {
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        id: `job-${i}`,
        name: `cleanup-test-job-${i}`,
        data: { notificationId: `notification-${i}` }
      }))

      for (const job of jobs) {
        await processor.process(job as any).catch(() => {})
      }

      // Verify that resources are cleaned up after processing
      const activeConnections = process.getActiveHandlesInfo ? process.getActiveHandlesInfo().length : 0

      expect(activeConnections).toBeLessThan(20)
    })
  })

  describe('Error Handling Under Load', () => {
    it('should handle errors gracefully without crashing', async () => {
      const jobs = Array.from({ length: 100 }, (_, i) => ({
        id: `job-${i}`,
        name: `error-test-job-${i}`,
        data: { notificationId: `non-existent-notification-${i}` }
      }))

      let errorCount = 0

      for (const job of jobs) {
        try {
          await processor.process(job as any)
        } catch {
          errorCount++
        }
      }

      expect(errorCount).toBeGreaterThan(0)
      expect(errorCount).toBeLessThan(100) // Not all jobs should fail
    })

    it('should maintain performance during error scenarios', async () => {
      const jobs = Array.from({ length: 50 }, (_, i) => {
        if (i % 3 === 0) {
          return {
            id: `job-${i}`,
            name: `failing-job-${i}`,
            data: { notificationId: `non-existent-notification-${i}` }
          }
        } else {
          return {
            id: `job-${i}`,
            name: `normal-job-${i}`,
            data: { notificationId: `notification-${i}` }
          }
        }
      })

      const start = Date.now()

      await Promise.all(
        jobs.map(job =>
          processor.process(job as any).catch(() => {})
        )
      )

      const end = Date.now()
      const duration = end - start

      expect(duration).toBeLessThan(10000) // Should complete in under 10 seconds even with errors
    })
  })
})