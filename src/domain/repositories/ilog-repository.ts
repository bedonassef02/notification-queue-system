import {
  NotificationLog,
  CreateLogInput
} from '@/types'

export interface ILogRepository {
  create(input: CreateLogInput): Promise<NotificationLog>
  findByNotificationId(notificationId: string): Promise<NotificationLog[]>
  findById(id: string): Promise<NotificationLog | null>
  delete(id: string): Promise<void>
  deleteByNotificationId(notificationId: string): Promise<void>
}