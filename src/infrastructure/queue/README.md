# Infrastructure Guide: BullMQ Queue System

This directory manages the core **Producer** logic for background jobs using **BullMQ** and **Upstash Redis**.

## Architecture Components

- **`connection.ts`**: A singleton IORedis instance optimized for serverless environments. It uses the `rediss://` protocol for TLS/SSL encryption required by Upstash.
- **`instance.ts`**: The typed `Queue` definitions for provider-specific queues (`EMAIL_QUEUE`, `SMS_QUEUE`, `PUSH_QUEUE`). It defines global default retry strategies (3 attempts with exponential backoff).
- **`producer.ts`**: The type-safe interface for adding jobs to the queue.

## Enqueuing a Job

Always use the `enqueueJob` helper from this directory to ensure your job is properly validated and deduplicated.

```typescript
import { enqueueJob } from "@/infrastructure/queue/producer";

const transaction = await enqueueJob("process-payment", {
  id: "order_123", // Used for IDEMPOTENCY
  name: "Sync Stripe Transaction", // Display name for BullMQ logs
  data: {
    orderId: "123",
    vendor: "stripe",
  },
});
```

---

## Reliability Features

### Idempotency

We map the `id` field from the `JobInput` directly to BullMQ's `jobId`. If a job with the same ID is already pending or completed, the duplicate will be rejected by Redis—protecting you from accidental double-processing.

### Exponential Backoff

Failed jobs aren't retried immediately. The current config uses a **10s base delay** with an **exponential** strategy (10s, 20s, 40s), which gives external APIs like Stripe or Twilio enough time to recover from intermittent issues.

### Serverless Stability

Connection pooling is minimized via **IORedis Singleton** and disabling `enableReadyCheck` to avoid timeout issues in Vercel/Azure/AWS Lambda functions.
