# Data Model: Code Quality and Performance Refactoring

**Feature**: [spec.md](spec.md)
**Date**: 2025-04-17
**Purpose**: Define entities, relationships, and validation rules for the refactored system

## Entity Overview

The refactored system maintains the existing core data model while enhancing type safety, validation, and performance characteristics. The primary entities are:

1. **Notification** - Represents a notification request and its lifecycle state
2. **NotificationLog** - Records individual delivery attempts for audit purposes
3. **RateLimitConfig** - Manages provider-specific rate limits (new for advanced features)

## Core Entities

### Notification

**Purpose**: Root entity representing a notification request with full lifecycle tracking.

**Fields**:

| Field | Type | Constraints | Description |
|-------|-------|-------------|-------------|
| `id` | UUID | Primary Key, Required | Unique identifier for the notification |
| `type` | Enum (EMAIL, SMS, PUSH) | Required, Indexed | Type of notification channel |
| `recipient` | String | Required, Indexed | Destination address (email, phone, token) |
| `payload` | JSONB | Required | Notification content and metadata |
| `status` | Enum (PENDING, PROCESSING, SENT, FAILED, PERMANENT_FAILURE) | Required, Indexed | Current lifecycle state |
| `attempts` | Integer | Default: 0, Non-negative | Number of delivery attempts made |
| `priority` | Enum (HIGH, MEDIUM, LOW) | Default: MEDIUM | Queue processing priority |
| `scheduledAt` | DateTime | Optional | When to process the notification |
| `idempotencyKey` | String | Optional, Unique | Prevents duplicate processing |
| `createdAt` | DateTime | Required, Indexed | Creation timestamp |
| `updatedAt` | DateTime | Required | Last modification timestamp |
| `lastAttemptAt` | DateTime | Optional | Timestamp of most recent delivery attempt |

**Relationships**:
- One-to-Many with `NotificationLog` (a notification can have multiple log entries)

**Indexes**:
- Primary index on `id`
- Composite index on `[recipient, status]` for filtering queries
- Index on `createdAt` for time-based queries
- Index on `status` for status filtering
- Unique index on `idempotencyKey` for duplicate prevention

**Validation Rules**:
- `type` must be one of: EMAIL, SMS, PUSH
- `status` must follow lifecycle: PENDING → PROCESSING → (SENT \| FAILED \| PERMANENT_FAILURE)
- `attempts` cannot be negative
- `priority` must be one of: HIGH, MEDIUM, LOW
- `scheduledAt` cannot be in the past when set
- `payload` must be valid JSON

### NotificationLog

**Purpose**: Audit trail for individual delivery attempts with provider-specific feedback.

**Fields**:

| Field | Type | Constraints | Description |
|-------|-------|-------------|-------------|
| `id` | UUID | Primary Key, Required | Unique identifier for the log entry |
| `notificationId` | UUID | Required, Foreign Key | Reference to parent notification |
| `provider` | String | Required | Name of external provider (zeptomail, twilio, onesignal) |
| `status` | Enum (SUCCESS, FAILURE) | Required | Outcome of this delivery attempt |
| `errorMessage` | Text | Optional | Error details if attempt failed |
| `providerResponse` | JSONB | Optional | Provider-specific response metadata |
| `attemptNumber` | Integer | Required, Positive | Sequential attempt number (1, 2, 3...) |
| `duration` | Integer | Optional, Non-negative | Time taken for delivery attempt (milliseconds) |
| `createdAt` | DateTime | Required | Timestamp of this delivery attempt |

**Relationships**:
- Many-to-One with `Notification` (logs belong to a single notification)

**Indexes**:
- Primary index on `id`
- Foreign key index on `notificationId` for efficient queries
- Index on `createdAt` for chronological retrieval

**Validation Rules**:
- `provider` must match configured providers
- `status` must be SUCCESS or FAILURE
- `errorMessage` is required when `status` is FAILURE
- `attemptNumber` must be positive
- `duration` must be non-negative if provided

### RateLimitConfig

**Purpose**: Configuration for provider-specific rate limiting to prevent API throttling.

**Fields**:

| Field | Type | Constraints | Description |
|-------|-------|-------------|-------------|
| `id` | UUID | Primary Key, Required | Unique identifier for the configuration |
| `providerType` | Enum (EMAIL, SMS, PUSH) | Required, Unique | Type of provider to limit |
| `maxJobs` | Integer | Required, Positive | Maximum jobs allowed in time window |
| `duration` | Integer | Required, Positive | Time window in seconds |
| `isEnabled` | Boolean | Required, Default: true | Whether rate limiting is active |
| `createdAt` | DateTime | Required | Configuration creation timestamp |
| `updatedAt` | DateTime | Required | Last modification timestamp |

**Relationships**:
- None (configuration entity)

**Indexes**:
- Primary index on `id`
- Unique index on `providerType`

**Validation Rules**:
- `providerType` must be one of: EMAIL, SMS, PUSH
- `maxJobs` must be positive
- `duration` must be positive
- Only one active configuration per provider type

## Entity Relationships

```
┌─────────────────┐
│  Notification   │
├─────────────────┤
│ id (PK)        │
│ type            │
│ recipient       │◄───────┐
│ payload         │         │
│ status          │         │
│ attempts        │         │
│ priority        │         │
│ scheduledAt     │         │
│ idempotencyKey  │         │
│ createdAt       │         │
│ updatedAt       │         │
│ lastAttemptAt   │         │
└─────────────────┘         │
         │ 1                  │
         │                    │
         │ N                  │
         │                    │
┌─────────────────┐         │
│ NotificationLog │         │
├─────────────────┤         │
│ id (PK)        │         │
│ notificationId │◄────────┘ (FK)
│ provider        │
│ status         │
│ errorMessage   │
│ providerResponse│
│ attemptNumber  │
│ duration       │
│ createdAt      │
└─────────────────┘

┌─────────────────┐
│ RateLimitConfig │
├─────────────────┤
│ id (PK)        │
│ providerType    │
│ maxJobs        │
│ duration       │
│ isEnabled      │
│ createdAt      │
│ updatedAt      │
└─────────────────┘
```

## State Transitions

### Notification Lifecycle

```
PENDING
    │
    ├─► PROCESSING (when worker picks up job)
    │       │
    │       ├─► SENT (successful delivery)
    │       │
    │       ├─► FAILED (temporary failure, retry possible)
    │       │       │
    │       │       └─► PROCESSING (retry)
    │       │
    │       └─► PERMANENT_FAILURE (max retries exceeded)
    │
    └─► PERMANENT_FAILURE (immediate failure, no retry)
```

**Rules**:
- PENDING → PROCESSING: Triggered when worker dequeues the job
- PROCESSING → SENT: Successful delivery confirmation from provider
- PROCESSING → FAILED: Temporary provider error, will retry
- FAILED → PROCESSING: Automatic retry within retry limit
- PROCESSING → PERMANENT_FAILURE: Max retries exceeded or unrecoverable error
- PENDING → PERMANENT_FAILURE: Validation error or immediate failure

**Validation**:
- Cannot transition from SENT to any other state (final state)
- Cannot transition from PERMANENT_FAILURE (final state)
- FAILED state requires incrementing `attempts` counter
- Each state transition must create a `NotificationLog` entry

## Validation Schema

### Input Validation (Zod)

```typescript
import { z } from 'zod'

export const NotificationType = z.enum(['EMAIL', 'SMS', 'PUSH'])
export const NotificationStatus = z.enum([
  'PENDING',
  'PROCESSING',
  'SENT',
  'FAILED',
  'PERMANENT_FAILURE'
])
export const NotificationPriority = z.enum(['HIGH', 'MEDIUM', 'LOW'])

export const CreateNotificationSchema = z.object({
  type: NotificationType,
  recipient: z.string().min(1).max(500),
  payload: z.record(z.any()).refine(
    (data) => JSON.stringify(data).length <= 10000,
    'Payload must be less than 10KB'
  ),
  priority: NotificationPriority.optional().default('MEDIUM'),
  scheduledAt: z.coerce.date().optional(),
  idempotencyKey: z.string().max(255).optional()
})

export const UpdateNotificationSchema = z.object({
  status: NotificationStatus,
  attempts: z.number().int().nonnegative().optional(),
  lastAttemptAt: z.coerce.date().optional()
})

export const CreateLogEntrySchema = z.object({
  notificationId: z.string().uuid(),
  provider: z.string().min(1).max(100),
  status: z.enum(['SUCCESS', 'FAILURE']),
  errorMessage: z.string().max(2000).optional(),
  providerResponse: z.record(z.any()).optional(),
  attemptNumber: z.number().int().positive(),
  duration: z.number().int().nonnegative().optional()
})
```

### Database Constraints

```prisma
// Prisma Schema Constraints
model Notification {
  id            String   @id @default(uuid())
  type          String
  recipient     String
  payload       Json
  status        String   @default("PENDING")
  attempts      Int      @default(0)
  priority      String   @default("MEDIUM")
  scheduledAt   DateTime?
  idempotencyKey String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastAttemptAt DateTime?

  @@index([recipient, status])
  @@index([createdAt])
  @@index([status])
  @@index([idempotencyKey])
}

model NotificationLog {
  id               String   @id @default(uuid())
  notificationId    String
  provider         String
  status           String
  errorMessage     String?
  providerResponse  Json?
  attemptNumber    Int
  duration         Int?
  createdAt        DateTime @default(now())

  notification     Notification @relation(fields: [notificationId], references: [id])

  @@index([notificationId])
  @@index([createdAt])
}

model RateLimitConfig {
  id           String   @id @default(uuid())
  providerType  String   @unique
  maxJobs      Int
  duration     Int
  isEnabled    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Performance Considerations

### Query Optimization

1. **Batch Retrieval**: Fetch notifications in batches for worker processing
2. **Selective Fields**: Query only required fields to reduce data transfer
3. **Index Usage**: Leverage composite indexes for common query patterns
4. **Connection Pooling**: Reuse database connections to reduce overhead

### Data Retention

- **Notifications**: Retain for 90 days (configurable)
- **Logs**: Retain for 30 days (configurable)
- **Archive Process**: Move old data to cold storage or delete

### Cache Strategy

- **Active Notifications**: Cache for 5 minutes
- **Status Lookups**: Cache for 1 minute
- **Rate Limits**: Cache in memory for immediate access

## Security Considerations

### Data Protection

- **PII Handling**: Identify and protect personally identifiable information
- **Payload Encryption**: Encrypt sensitive data in JSONB fields if required
- **Audit Trail**: Maintain immutable logs for compliance

### Access Control

- **Row-Level Security**: Implement if multi-tenant requirements emerge
- **API Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Strict validation on all user inputs

## Migration Notes

### Schema Changes

The refactoring will **NOT** require schema changes to the core `Notification` and `NotificationLog` entities. The existing schema will be preserved to ensure backward compatibility.

### New Entities

`RateLimitConfig` is the only new entity introduced for advanced queue features, which can be added via migration without affecting existing data.

### Data Migration

No data migration is required. The refactoring focuses on:
- Code structure and organization
- Performance optimization
- Type safety improvements
- Error handling enhancements

Existing data will continue to work without modification.

## Summary

The data model maintains the existing core entities (`Notification`, `NotificationLog`) while introducing enhanced validation, performance optimization, and the new `RateLimitConfig` entity. The refactoring ensures:

- **Type Safety**: Comprehensive TypeScript interfaces and Zod schemas
- **Performance**: Strategic indexing and query optimization
- **Data Integrity**: Foreign key constraints and validation rules
- **Auditability**: Immutable log trail for compliance
- **Scalability**: Design supports horizontal scaling
- **Backward Compatibility**: No breaking changes to existing data
