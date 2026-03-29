# Data Model: Notification System

## 1. Entities

### Notification
- `id` (UUID): Primary Key
- `type` (Enum): `EMAIL`, `SMS`, `PUSH`
- `recipient` (String): e.g., email address, phone number
- `payload` (JSONB): Provider-specific data (template IDs, variables)
- `status` (Enum): `PENDING`, `PROCESSING`, `SENT`, `FAILED`, `PERMANENT_FAILURE`
- `attempts` (Int): Current count of attempts
- `idempotencyKey` (String, Unique): Prevents duplicate creation
- `lastAttemptAt` (Timestamp): Time of the most recent send attempt
- `createdAt` (Timestamp): Intent creation time
- `updatedAt` (Timestamp): Last state change time

### NotificationLog
- `id` (UUID): Primary Key
- `notificationId` (UUID, Foreign Key): Reference to the parent notification
- `status` (Enum): The resulting status of the specific attempt
- `errorMessage` (String, Optional): Raw error from the provider
- `metadata` (JSONB): Full provider response headers/body for debugging
- `createdAt` (Timestamp): Attempt execution time

## 2. Relationships
- `Notification` has many `NotificationLog` (1:N)
- `NotificationLog` belongs to `Notification`

## 3. Validation Rules
- `recipient` must not be empty.
- `type` must be one of the specified Enum values.
- `payload` must be a valid JSON object.
- `idempotencyKey` must be unique across all notifications.
- `attempts` must be non-negative.
