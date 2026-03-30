# Research: Notification Worker Processor

This research identifies best practices and patterns for handling asynchronous notification delivery in a distributed system.

## Research Task 1: Distributed Worker Scalability

**Question**: How to ensure the worker remains scalable and can be isolated from the Next.js API?

- **Decision**: Standalone Worker Architecture.
- **Rationale**: The worker is implemented under `src/workers` and runs as a separate Node.js process. This isolates it from the web server runtime (e.g., Vercel), allowing it to be horizontally scaled in a containerized environment (e.g., Docker) without impacting API latency.
- **Alternatives considered**:
  - **In-process Next.js workers**: Rejected due to serverless runtime limits (Vercel Lambdas have strict timeouts).
  - **Edge Middleware**: Rejected as provider API calls require longer timeouts than supported by the Edge runtime.

## Research Task 2: Multi-Channel Resilience (Retries & Backoff)

**Question**: What is the most effective retry policy for diverse providers (ZeptoMail, Twilio)?

- **Decision**: Exponential Backoff (v. BullMQ Defaults).
- **Rationale**: Providers frequently experience transient "Rate Limit" or "Gateway Timeout" errors. Exponential backoff (starting at 10s) ensures we don't overwhelm external APIs during a failure spree.
- **Decision**: 3 Retries.
- **Rationale**: Standard industry practice for 99.9% delivery success for non-critical notifications.

## Research Task 3: Idempotency Pattern

**Question**: How to achieve true "exactly-once" delivery in a distributed queue system?

- **Decision**: Database-Level Idempotency Hook.
- **Rationale**: The processor performs a pre-emptive check on the `Notification` record status in PostgreSQL (`SENT` check). Combined with BullMQ's `jobId` (which defaults to the notification's internal ID), this provides double protection against duplicate message sending.

## Decision Audit Log

| Component              | Decision                                 | Rationale                                                                          |
| :--------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------- |
| **Worker Script**      | `ts-node-esm src/workers/main-worker.ts` | Best for utilizing ESM shared modules and ensuring compatibility with TypeScript.  |
| **Provider Selection** | Factory Pattern                          | Allows dynamic channel selection at runtime without modifying the processor logic. |
| **Error Handling**     | Throws to BullMQ                         | Simple but effective; leverages BullMQ's state-management capabilities.            |
