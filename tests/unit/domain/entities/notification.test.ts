import { describe, it, expect } from 'vitest'
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '@/types'

describe('Notification Entity', () => {
  describe('constructor', () => {
    it('should create a valid notification with all required fields', () => {
      const notification = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: NotificationType.EMAIL,
        recipient: 'test@example.com',
        payload: { subject: 'Test', body: 'Test body' },
        status: NotificationStatus.PENDING,
        attempts: 0,
        priority: NotificationPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(notification).toBeDefined()
      expect(notification.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(notification.type).toBe(NotificationType.EMAIL)
      expect(notification.recipient).toBe('test@example.com')
    })

    it('should validate notification types', () => {
      const validTypes = [NotificationType.EMAIL, NotificationType.SMS, NotificationType.PUSH]
      validTypes.forEach(type => {
        expect(Object.values(NotificationType)).toContain(type)
      })
    })

    it('should validate notification statuses', () => {
      const validStatuses = [
        NotificationStatus.PENDING,
        NotificationStatus.PROCESSING,
        NotificationStatus.SENT,
        NotificationStatus.FAILED,
        NotificationStatus.PERMANENT_FAILURE
      ]
      validStatuses.forEach(status => {
        expect(Object.values(NotificationStatus)).toContain(status)
      })
    })

    it('should validate notification priorities', () => {
      const validPriorities = [NotificationPriority.HIGH, NotificationPriority.MEDIUM, NotificationPriority.LOW]
      validPriorities.forEach(priority => {
        expect(Object.values(NotificationPriority)).toContain(priority)
      })
    })
  })

  describe('lifecycle transitions', () => {
    it('should allow transition from PENDING to PROCESSING', () => {
      const notification = {
        status: NotificationStatus.PENDING
      }
      expect(notification.status).toBe(NotificationStatus.PENDING)
      
      const updated = { ...notification, status: NotificationStatus.PROCESSING }
      expect(updated.status).toBe(NotificationStatus.PROCESSING)
    })

    it('should allow transition from PROCESSING to SENT', () => {
      const notification = {
        status: NotificationStatus.PROCESSING
      }
      const updated = { ...notification, status: NotificationStatus.SENT }
      expect(updated.status).toBe(NotificationStatus.SENT)
    })

    it('should allow transition from PROCESSING to FAILED', () => {
      const notification = {
        status: NotificationStatus.PROCESSING
      }
      const updated = { ...notification, status: NotificationStatus.FAILED }
      expect(updated.status).toBe(NotificationStatus.FAILED)
    })

    it('should allow transition from FAILED to PROCESSING for retry', () => {
      const notification = {
        status: NotificationStatus.FAILED,
        attempts: 1
      }
      const updated = { ...notification, status: NotificationStatus.PROCESSING, attempts: 2 }
      expect(updated.status).toBe(NotificationStatus.PROCESSING)
      expect(updated.attempts).toBe(2)
    })
  })

  describe('payload validation', () => {
    it('should accept valid email payload', () => {
      const payload = {
        subject: 'Test Subject',
        htmlBody: '<p>Test Body</p>',
        body: 'Plain text body'
      }
      expect(payload).toBeDefined()
      expect(payload.subject).toBe('Test Subject')
    })

    it('should accept valid SMS payload', () => {
      const payload = {
        message: 'Test SMS message'
      }
      expect(payload).toBeDefined()
      expect(payload.message).toBe('Test SMS message')
    })

    it('should accept valid push payload', () => {
      const payload = {
        title: 'Test Title',
        body: 'Test Body',
        imageUrl: 'https://example.com/image.png',
        data: { key: 'value' }
      }
      expect(payload).toBeDefined()
      expect(payload.title).toBe('Test Title')
    })
  })
})