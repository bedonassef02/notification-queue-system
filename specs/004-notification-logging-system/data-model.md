# Data Model: Notification Logging System

## Entity: NotificationLog

The `NotificationLog` represents a single delivery attempt or state transition for a notification.

### Fields

| Field            | Type          | Description                                                               |
| ---------------- | ------------- | ------------------------------------------------------------------------- |
| `id`             | `UUID`        | Unique identifier for the log entry.                                      |
| `notificationId` | `UUID`        | Foreign key referencing the parent notification.                          |
| `status`         | `Enum`        | The outcome of the attempt ([SENT, FAILED, PERMANENT_FAILURE]).           |
| `attemptNumber`  | `Int`         | Which retry attempt this was (1-based). [NEW]                             |
| `errorMessage`   | `Text?`       | The error message from the provider if the attempt failed.                |
| `metadata`       | `JsonB?`      | Provider-specific response data (e.g., Message ID, detailed error codes). |
| `createdAt`      | `Timestamptz` | When the attempt was logged.                                              |

### Relationships

- **Notification (1) -> NotificationLog (N)**: A single notification can have multiple log entries (one for each retry attempt).

---

## Prisma Schema Update

```prisma
model NotificationLog {
  id             String             @id @default(uuid()) @db.Uuid
  notificationId String             @db.Uuid
  notification   Notification       @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  status         NotificationStatus
  attemptNumber  Int                @default(1) // Added for tracking retries
  errorMessage   String?            @db.Text
  metadata       Json?              @db.JsonB
  createdAt      DateTime           @default(now()) @db.Timestamptz

  @@map("notification_logs")
}
```
