// src/application/services/logging-service.ts
import { LogRepository } from '@/infrastructure/database/log-repository';
import { NotificationStatus } from '@/domain/entities/notification';

/**
 * Logging Service
 * Provides a unified interface for recording notification delivery lifecycle events.
 */
export class LoggingService {
  private logRepository: LogRepository;

  constructor() {
    this.logRepository = new LogRepository();
  }

  /**
   * Records a notification delivery attempt with status, attempt number, and metadata.
   */
  async logAttempt(
    notificationId: string,
    status: NotificationStatus,
    attemptNumber: number,
    error?: string,
    metadata?: any
  ) {
    try {
      const log = await this.logRepository.create(
        notificationId,
        status,
        attemptNumber,
        error,
        metadata
      );
      
      // Secondary sink: Structured console logging for observability
      const logMessage = `[Notification ${status}] ID: ${notificationId} | Attempt: ${attemptNumber} ${error ? `| Error: ${error}` : ''}`;
      
      if (status === NotificationStatus.SENT) {
        console.info(logMessage);
      } else if (status === NotificationStatus.FAILED || status === NotificationStatus.PERMANENT_FAILURE) {
        console.error(logMessage);
      } else {
        console.log(logMessage);
      }

      return log;
    } catch (err) {
      // We don't want to fail the main process if logging fails, but we should report it.
      console.error(`CRITICAL: Failed to write delivery log for ${notificationId}:`, err);
    }
  }

  /**
   * Retrieves log history for a specific notification.
   */
  async getHistory(notificationId: string) {
    return this.logRepository.findByNotificationId(notificationId);
  }

  /**
   * Retrieves all terminal failures.
   */
  async getDeadLetters() {
    return this.logRepository.findDeadLetters();
  }
}
