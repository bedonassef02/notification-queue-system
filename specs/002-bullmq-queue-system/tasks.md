# Tasks: BullMQ Queue System

**Branch**: `002-bullmq-queue-system` | **Date**: 2026-03-29 | **Plan**: [plan.md](file:///c:/Users/Bedo/Desktop/next.js/specs/002-bullmq-queue-system/plan.md)

## Implementation Strategy

We focus on building the **Infrastructure Core** first, ensuring that the Redis connection and BullMQ instance are properly configured for serverless execution. Once foundational, we'll implement a type-safe consumer-agnostic producer.

## Phase 1: Setup

- [x] T001 Initialize queue directory structure in `src/infrastructure/queue`
- [x] T002 Ensure dependencies are available (`bullmq`, `ioredis`, `zod`, `dotenv`)

## Phase 2: Foundational (Infrastructure Core)

- [x] T003 [P] Implement Redis connection utility with serverless flags in `src/infrastructure/queue/connection.ts`
- [x] T004 [P] Create and configure global BullMQ Queue instance in `src/infrastructure/queue/instance.ts`

## Phase 3: User Story 1 (US1) - Type-Safe Job Producer

**Goal**: Standardize the enqueuing of jobs with automatic idempotency and retry handling.
**Test Criteria**: Calling the producer generates a BullMQ job with a custom `jobId` and exponential backoff configuration.

- [x] T005 [P] [US1] Define Zod validation schemas for Job payloads in `src/infrastructure/queue/producer.ts`
- [x] T006 [US1] Implement the `enqueueJob` producer wrapper in `src/infrastructure/queue/producer.ts`

## Phase 4: Integration & Example

**Goal**: Verify the queue system works within the Next.js API environment.
**Test Criteria**: A POST request to the example route successfully enqueues a job into Redis.

- [x] T007 Implement example API route for job creation in `src/app/api/example-job/route.ts`

## Phase 5: Refactoring & Hardening (Completed)

**Goal**: Elevate the project to enterprise-grade with Clean Architecture patterns.

- [x] T009 [P] Centralize Zod schemas into `src/shared/validators/`
- [x] T010 [P] Implement specialized `NotificationRepository` and `LogRepository`
- [x] T011 [P] Create `NotificationService` as a centralized controller layer
- [x] T012 [P] Refactor API routes to be thin controllers calling the service layer
- [x] T013 [P] Synchronize all documentation (`DEVELOPER_GUIDE`, `PROJECT_OVERVIEW`)
