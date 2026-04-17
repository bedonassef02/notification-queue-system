// src/application/services/logging-service.ts
import { LogRepository } from "@/infrastructure/database/log-repository";
import { NotificationStatus } from "@/domain/entities/notification";

export class LoggingService {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository = new LogRepository()) {
    this.logRepository = logRepository;
  }

  /**
   * Records a notification delivery attempt with status, attempt number and metadata.
   */
  async logAttempt(
    notificationId: string,
    status: NotificationStatus,
    attemptNumber: number,
    error?: string,
    metadata?: any,
  ) {
    try {
      const log = await this.logRepository.create({
        notificationId,
        provider: 'default',
        status: (status === NotificationStatus.SENT ? 'SUCCESS' as any : 
                 status === NotificationStatus.FAILED || status === NotificationStatus.PERMANENT_FAILURE ? 'FAILURE' as any : 'SUCCESS'),
        attemptNumber,
        errorMessage: error,
        providerResponse: metadata
      })

      const logStatus = status as any as NotificationStatus
      const logMessage = `[Notification ${logStatus}] ID: ${notificationId} | Attempt: ${attemptNumber} ${error ? `| Error: ${error}` : ""}`;

      if (logStatus === NotificationStatus.SENT) {
        console.info(logMessage)
      } else if (
        logStatus === NotificationStatus.FAILED ||
        logStatus === NotificationStatus.PERMANENT_FAILURE
      ) {
        console.error(logMessage)
      } else {
        console.log(logMessage)
      }

      return log;
    } catch (err) {
      // We don't want to fail the main process if logging fails, but we should report it.
      console.error(
        `CRITICAL: Failed to write delivery log for ${notificationId}:`,
        err,
      );
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
