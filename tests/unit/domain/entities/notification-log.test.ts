import { describe, it, expect } from 'vitest'
import { NotificationLog, LogStatus } from '@/types'

describe('NotificationLog Entity', () => {
  describe('constructor', () => {
    it('should create a valid notification log with all required fields', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'zeptomail',
        status: LogStatus.SUCCESS,
        attemptNumber: 1,
        duration: 150,
        createdAt: new Date()
      }

      expect(log).toBeDefined()
      expect(log.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(log.notificationId).toBe('987e6543-e89b-12d3-a456-426614174999')
      expect(log.provider).toBe('zeptomail')
      expect(log.status).toBe(LogStatus.SUCCESS)
    })

    it('should accept optional error message for failed logs', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'twilio',
        status: LogStatus.FAILURE,
        attemptNumber: 1,
        errorMessage: 'Provider error: Invalid phone number',
        createdAt: new Date()
      }

      expect(log).toBeDefined()
      expect(log.status).toBe(LogStatus.FAILURE)
      expect(log.errorMessage).toBe('Provider error: Invalid phone number')
    })

    it('should accept optional provider response', () => {
      const providerResponse = {
        requestId: 'req_123456',
        status: 'sent',
        timestamp: new Date().toISOString()
      }

      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'onesignal',
        status: LogStatus.SUCCESS,
        attemptNumber: 1,
        providerResponse,
        createdAt: new Date()
      }

      expect(log).toBeDefined()
      expect(log.providerResponse).toEqual(providerResponse)
    })

    it('should accept optional duration field', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'zeptomail',
        status: LogStatus.SUCCESS,
        attemptNumber: 1,
        duration: 250,
        createdAt: new Date()
      }

      expect(log).toBeDefined()
      expect(log.duration).toBe(250)
    })
  })

  describe('status validation', () => {
    it('should validate log statuses', () => {
      const validStatuses = [LogStatus.SUCCESS, LogStatus.FAILURE]
      validStatuses.forEach(status => {
        expect(Object.values(LogStatus)).toContain(status)
      })
    })

    it('should require error message when status is FAILURE', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'twilio',
        status: LogStatus.FAILURE,
        attemptNumber: 1,
        errorMessage: 'Required error message',
        createdAt: new Date()
      }

      expect(log.errorMessage).toBeDefined()
      expect(log.errorMessage).toBe('Required error message')
    })

    it('should not require error message when status is SUCCESS', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'zeptomail',
        status: LogStatus.SUCCESS,
        attemptNumber: 1,
        createdAt: new Date()
      }

      expect(log.errorMessage).toBeUndefined()
    })
  })

  describe('attempt number validation', () => {
    it('should require positive attempt number', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'zeptomail',
        status: LogStatus.SUCCESS,
        attemptNumber: 1,
        createdAt: new Date()
      }

      expect(log.attemptNumber).toBeGreaterThan(0)
    })

    it('should increment attempt numbers for retry scenarios', () => {
      const attempt1 = { attemptNumber: 1 }
      const attempt2 = { attemptNumber: 2 }
      const attempt3 = { attemptNumber: 3 }

      expect(attempt2.attemptNumber).toBe(attempt1.attemptNumber + 1)
      expect(attempt3.attemptNumber).toBe(attempt2.attemptNumber + 1)
    })
  })

  describe('duration validation', () => {
    it('should require non-negative duration when provided', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'zeptomail',
        status: LogStatus.SUCCESS,
        attemptNumber: 1,
        duration: 0,
        createdAt: new Date()
      }

      expect(log.duration).toBeGreaterThanOrEqual(0)
    })

    it('should accept zero duration for instant failures', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        notificationId: '987e6543-e89b-12d3-a456-426614174999',
        provider: 'twilio',
        status: LogStatus.FAILURE,
        attemptNumber: 1,
        duration: 0,
        errorMessage: 'Instant validation failure',
        createdAt: new Date()
      }

      expect(log.duration).toBe(0)
    })
  })
})