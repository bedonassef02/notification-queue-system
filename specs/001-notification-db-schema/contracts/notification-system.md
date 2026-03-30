# Contracts: Notification System

## 1. API Contracts

### POST /api/notifications/enqueue

Request Payload:

```json
{
  "type": "EMAIL" | "SMS" | "PUSH",
  "recipient": "string",
  "payload": {
    "templateId": "string",
    "variables": { ... }
  },
  "idempotencyKey": "string (optional)"
}
```

Response (201 Created):

```json
{
  "id": "uuid",
  "status": "PENDING"
}
```

## 2. Service Interface Contracts

### INotificationService

Exposes the capability to enqueue and process notifications.

```typescript
interface INotificationService {
  /**
   * Enqueues a notification into the persistent queue.
   */
  enqueue(
    type: NotificationType,
    recipient: string,
    payload: object,
    idempotencyKey?: string,
  ): Promise<Notification>;

  /**
   * Processes a specific notification ID, hitting the provider.
   */
  process(id: string): Promise<ProcessResult>;
}

enum NotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
}

type ProcessResult = {
  status: "SENT" | "FAILED" | "PERMANENT_FAILURE";
  error?: string;
};
```
