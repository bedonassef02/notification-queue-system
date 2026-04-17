import {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput
} from '@/types'

export interface INotificationRepository {
  create(input: CreateNotificationInput): Promise<Notification>
  findById(id: string): Promise<Notification | null>
  findByRecipient(recipient: string): Promise<Notification[]>
  findByStatus(status: string): Promise<Notification[]>
  update(id: string, input: UpdateNotificationInput): Promise<Notification>
  delete(id: string): Promise<void>
  findByIdempotencyKey(key: string): Promise<Notification | null>
  batchUpdate(updates: Array<{ id: string; input: UpdateNotificationInput }>): Promise<Notification[]>
}