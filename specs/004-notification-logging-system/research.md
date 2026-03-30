# Research: Notification Logging Best Practices

## Decision: Unified Database Audit Logs

Implement a central `NotificationLog` table in PostgreSQL (via Prisma) to track every interaction with a notification delivery attempt.

### Rationale
- **Single Source of Truth**: Easy to query and maintain consistency.
- **Relational Integrity**: Uses Prisma relations for `Notification -> NotificationLog` linking.
- **Performance**: PostgreSQL's `JSONB` allows for flexible provider-specific metadata without schema changes.

### Alternatives Considered
- **Redis Streams**: High performance but harder to query for long-term historical audits.
- **Log Files**: Fast but lacks relational integration and makes API retrieval difficult.

## Decision: Dedicated Logging Service

Create a `LoggingService` in the application layer.

### Rationale
- **Isolation**: Keeps worker logic and repository logic separated.
- **Flexibility**: Can easily add console logging (JSON/Pino) later.
- **Reusability**: API routes or other services can use it to log miscellaneous events.

## Decision: Tracking Attempt Numbers

Each log entry will explicitly store the `attemptNumber`.

### Rationale
- **Observability**: Directly corresponds to the BullMQ retry count.
- **Troubleshooting**: Helps identify if a failure is intermittent or persistent based on the attempt history.
