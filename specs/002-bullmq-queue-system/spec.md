# Feature Specification: BullMQ Queue System

**Feature Branch**: `002-bullmq-queue-system`  
**Created**: 2026-03-29  
**Status**: Completed  
**Input**: User description: "Implement a standalone BullMQ queue system optimized for Upstash Redis and Next.js serverless environments, including producer logic and retry configuration."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Type-Safe Job Ingestion (Priority: P1)

As a developer, I want a standardized way to enqueue background jobs so that I can offload heavy processing from my API routes without worrying about duplicate jobs or connection leaks.

**Why this priority**: This is the core functionality that enables all background processing in the application.

**Independent Test**: Can be fully tested by hitting the `/api/example-job` endpoint and verifying that exactly one job per unique `transactionId` is created in Redis.

**Acceptance Scenarios**:

1. **Given** a valid Redis connection, **When** a job is enqueued with a unique ID, **Then** it should appear in the BullMQ queue exactly once.
2. **Given** an existing job ID, **When** a new job is enqueued with the same ID, **Then** BullMQ should reject the duplicate job.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST maintain a singleton Redis connection using `ioredis`.
- **FR-002**: System MUST use `rediss://` for TLS compatibility with Upstash.
- **FR-003**: System MUST provide a Zod-validated `enqueueJob` wrapper.
- **FR-004**: System MUST implement exponential backoff retries (3 attempts).
- **FR-005**: System MUST automatically map payload IDs to BullMQ `jobId` for idempotency.

### Key Entities

- **Queue Instance**: The central job coordinator.
- **Job Producer**: The interface used by API routes to submit tasks.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every job enqueued through the producer is successfully persisted to Redis.
- **SC-002**: Jobs are retried automatically with increasing delays on failure.
- **SC-003**: Duplicate job submissions with the same reference ID do not create redundant work.
- **SC-004**: Connection count to Upstash remains stable across multiple serverless function invocations.

## Assumptions

- **Connectivity**: Stable internet access is available to reach the Upstash endpoint.
- **Credentials**: Valid `UPSTASH_REDIS_URL` is provided in the `.env` file.
- **Serverless Limits**: Vercel/lambda execution limits are taken into account via lazy connection initialization.
