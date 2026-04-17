import { describe, it, expect, vi } from 'vitest'
import { INotificationRepository } from '@/domain/repositories/inotification-repository'
import { ILogRepository } from '@/domain/repositories/ilog-repository'
import {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput
} from '@/types'

describe('Repository Interfaces', () => {
  describe('INotificationRepository', () => {
    let mockRepo: INotificationRepository

    beforeEach(() => {
      mockRepo = {
        create: vi.fn(),
        findById: vi.fn(),
        findByRecipient: vi.fn(),
        findByStatus: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findByIdempotencyKey: vi.fn(),
        batchUpdate: vi.fn()
      }
    })

    it('should define create method', async () => {
      const input: CreateNotificationInput = {
        type: 'EMAIL' as any,
        recipient: 'test@example.com',
        payload: { subject: 'Test' }
      }

      mockRepo.create.mockResolvedValue({
        id: '123',
        ...input,
        status: 'PENDING' as any,
        attempts: 0,
        priority: 'MEDIUM' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await mockRepo.create(input)
      expect(mockRepo.create).toHaveBeenCalledWith(input)
      expect(result).toBeDefined()
    })

    it('should define findById method', async () => {
      mockRepo.findById.mockResolvedValue(null)
      const result = await mockRepo.findById('123')
      expect(mockRepo.findById).toHaveBeenCalledWith('123')
      expect(result).toBeNull()
    })

    it('should define findByRecipient method', async () => {
      mockRepo.findByRecipient.mockResolvedValue([])
      const result = await mockRepo.findByRecipient('test@example.com')
      expect(mockRepo.findByRecipient).toHaveBeenCalledWith('test@example.com')
      expect(result).toEqual([])
    })

    it('should define findByStatus method', async () => {
      mockRepo.findByStatus.mockResolvedValue([])
      const result = await mockRepo.findByStatus('PENDING')
      expect(mockRepo.findByStatus).toHaveBeenCalledWith('PENDING')
      expect(result).toEqual([])
    })

    it('should define update method', async () => {
      const input: UpdateNotificationInput = {
        status: 'SENT' as any
      }
      mockRepo.update.mockResolvedValue({
        id: '123',
        type: 'EMAIL' as any,
        recipient: 'test@example.com',
        payload: {},
        status: 'SENT' as any,
        attempts: 1,
        priority: 'MEDIUM' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await mockRepo.update('123', input)
      expect(mockRepo.update).toHaveBeenCalledWith('123', input)
      expect(result).toBeDefined()
    })

    it('should define delete method', async () => {
      mockRepo.delete.mockResolvedValue(undefined)
      await mockRepo.delete('123')
      expect(mockRepo.delete).toHaveBeenCalledWith('123')
    })

    it('should define findByIdempotencyKey method', async () => {
      mockRepo.findByIdempotencyKey.mockResolvedValue(null)
      const result = await mockRepo.findByIdempotencyKey('unique-key-123')
      expect(mockRepo.findByIdempotencyKey).toHaveBeenCalledWith('unique-key-123')
      expect(result).toBeNull()
    })

    it('should define batchUpdate method', async () => {
      const updates = [
        { id: '123', input: { status: 'SENT' as any } },
        { id: '456', input: { status: 'SENT' as any } }
      ]
      mockRepo.batchUpdate.mockResolvedValue([])
      const result = await mockRepo.batchUpdate(updates)
      expect(mockRepo.batchUpdate).toHaveBeenCalledWith(updates)
      expect(result).toEqual([])
    })
  })

  describe('ILogRepository', () => {
    let mockRepo: ILogRepository

    beforeEach(() => {
      mockRepo = {
        create: vi.fn(),
        findByNotificationId: vi.fn(),
        findById: vi.fn(),
        delete: vi.fn(),
        deleteByNotificationId: vi.fn()
      }
    })

    it('should define create method', async () => {
      const input = {
        notificationId: '123',
        provider: 'zeptomail',
        status: 'SUCCESS' as any,
        attemptNumber: 1
      }

      mockRepo.create.mockResolvedValue({
        id: '456',
        ...input,
        createdAt: new Date()
      })

      const result = await mockRepo.create(input)
      expect(mockRepo.create).toHaveBeenCalledWith(input)
      expect(result).toBeDefined()
    })

    it('should define findByNotificationId method', async () => {
      mockRepo.findByNotificationId.mockResolvedValue([])
      const result = await mockRepo.findByNotificationId('123')
      expect(mockRepo.findByNotificationId).toHaveBeenCalledWith('123')
      expect(result).toEqual([])
    })

    it('should define findById method', async () => {
      mockRepo.findById.mockResolvedValue(null)
      const result = await mockRepo.findById('456')
      expect(mockRepo.findById).toHaveBeenCalledWith('456')
      expect(result).toBeNull()
    })

    it('should define delete method', async () => {
      mockRepo.delete.mockResolvedValue(undefined)
      await mockRepo.delete('456')
      expect(mockRepo.delete).toHaveBeenCalledWith('456')
    })

    it('should define deleteByNotificationId method', async () => {
      mockRepo.deleteByNotificationId.mockResolvedValue(undefined)
      await mockRepo.deleteByNotificationId('123')
      expect(mockRepo.deleteByNotificationId).toHaveBeenCalledWith('123')
    })
  })
})