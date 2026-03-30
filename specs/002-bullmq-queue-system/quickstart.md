# Quickstart: BullMQ Queue System

## 1. Environment Setup

Configure your redis URL in `.env`:

```bash
UPSTASH_REDIS_URL="rediss://default:token@region.upstash.io:6379"
```

## 2. Using the Producer

From any Next.js API route or Server Action:

```typescript
import { enqueueJob } from "@/infrastructure/queue/producer";

export async function POST(req: Request) {
  const result = await enqueueJob("process-transaction", {
    id: "txn-1234", // Deduplication key
    data: { amount: 100, currency: "USD" },
  });

  return Response.json(result);
}
```

## 3. Retries & Backoff

Jobs will automatically retry based on the global configuration in `src/infrastructure/queue/instance.ts`.

## 4. Monitoring

Use `bull-board` or the Upstash Redis console to monitor job progress and failure logs.
