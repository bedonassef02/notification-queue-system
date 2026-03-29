# Tasks: BullMQ Queue System

**Branch**: `002-bullmq-queue-system` | **Date**: 2026-03-29 | **Plan**: [plan.md](file:///c:/Users/Bedo/Desktop/next.js/specs/002-bullmq-queue-system/plan.md)

## Implementation Strategy

We focus on building the **Infrastructure Core** first, ensuring that the Redis connection and BullMQ instance are properly configured for serverless execution. Once foundational, we'll implement a type-safe consumer-agnostic producer.

## Phase 1: Setup

- [X] T001 Initialize queue directory structure in `src/infrastructure/queue`
- [X] T002 Ensure dependencies are available (`bullmq`, `ioredis`, `zod`, `dotenv`)

## Phase 2: Foundational (Infrastructure Core)

- [X] T003 [P] Implement Redis connection utility with serverless flags in `src/infrastructure/queue/connection.ts`
- [X] T004 [P] Create and configure global BullMQ Queue instance in `src/infrastructure/queue/instance.ts`

## Phase 3: User Story 1 (US1) - Type-Safe Job Producer

**Goal**: Standardize the enqueuing of jobs with automatic idempotency and retry handling.
**Test Criteria**: Calling the producer generates a BullMQ job with a custom `jobId` and exponential backoff configuration.

- [ ] T005 [P] [US1] Define Zod validation schemas for Job payloads in `src/infrastructure/queue/producer.ts`
- [ ] T006 [US1] Implement the `enqueueJob` producer wrapper in `src/infrastructure/queue/producer.ts`

## Phase 4: Integration & Example

**Goal**: Verify the queue system works within the Next.js API environment.
**Test Criteria**: A POST request to the example route successfully enqueues a job into Redis.

- [ ] T007 Implement example API route for job creation in `src/app/api/example-job/route.ts`

## Final Phase: Documentation

- [ ] T008 Add technical usage guide for developers in `src/infrastructure/queue/README.md`

## Dependencies

- Phase 2 depends on Phase 1 setup.
- Phase 3 depends on Phase 2 infrastructure.
- Phase 4 depends on Phase 3 producer availability.

## Parallel Execution Examples

- T003, T004 (Foundational setup)
- T005, T008 (Schema and documentation can be done while functional code is implemented locally)
