# Contract: Notification Job Payload

This document defines the schema for jobs enqueued into the `main-job-queue` for processing by the Notification Worker.

## Job Name: `send-notification`

The worker listens for jobs named `send-notification`.

### Payload Schema (Zod)

The payload must provide the internal notification identity for database reconciliation.

```typescript
export const JobInputSchema = z.object({
  id: z.string().uuid(),         // Unique job identifier for BullMQ idempotency
  name: z.string().min(1),       // Descriptive job name
  data: z.object({
    notificationId: z.string().uuid(), // Reference to the Notification entity in DB
  }),
});
```

### Example Payload

```json
{
  "notificationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Logic Flow

1. **Extraction**: Worker extracts `notificationId`.
2. **Persistence**: Worker fetches full details (Recipient, Type, Payload) from Neon PostgreSQL.
3. **Execution**: Worker selects provider from `factory.ts` and executes `send()`.
4. **Conclusion**: Worker updates status and logs success/failure in the DB.
