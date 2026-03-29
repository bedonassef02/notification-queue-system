# Plan: BullMQ Queue System (Standalone)

## 1. Concept Summary
Building a standalone, production-ready BullMQ queue infrastructure for a Next.js App Router environment, specifically optimized for Upstash Redis (managed, serverless).

## 2. Technical Context
- **Tech Stack**: TypeScript, Node.js 20+, `bullmq`, `ioredis`, `zod`.
- **Infrastructure**: Upstash Redis (Serverless).
- **Strategy**: 
  - **Connection**: Singleton `ioredis` with serverless-compatible flags.
  - **Producer**: Generic, type-safe wrapper using Zod for payload validation.
  - **Retry System**: Exponential backoff (Starts at 10s).
  - **Idempotency**: Automatic using custom `jobId` from business keys.

## 3. Directory Structure
```text
src/
├── infrastructure/
│   └── queue/
│       ├── connection.ts    # IORedis setup
│       ├── instance.ts      # BullMQ Queue instance
│       └── producer.ts      # Enqueue utility
├── app/
│   └── api/
│       └── example-job/     # API Route leveraging the producer
│           └── route.ts
```

## 4. Key Design Decisions
- **Lazy Singleton**: Reusing a single `ioredis` connection across HTTP requests to avoid pool exhaustion.
- **Zod at the Edge**: Every job enqueued will be validated before it touches Redis.
- **Rediss Protocol**: Handling TLS by default for Upstash security.

## 5. Success Criteria
- [X] Redis connection is successfully established with TLS.
- [X] Jobs are enqueued with 3 retry attempts and exponential backoff.
- [X] Duplicate jobs (same `jobId`) are rejected by Redis.
- [X] Integration with a Next.js API route works without latency spikes.
