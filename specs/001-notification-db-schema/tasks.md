# Tasks: Notification Database Schema

**Branch**: `001-notification-db-schema` | **Date**: 2026-03-29 | **Plan**: [plan.md](file:///c:/Users/Bedo/Desktop/next.js/specs/001-notification-db-schema/plan.md)

## Implementation Strategy

We follow the **MVP First** strategy. Phase 3 (US1) establishes the core ingestion capability. Phase 4 (US2) completes the auditing requirements. Phase 5 handles the actual execution and integration with external providers.

## Phase 1: Setup

- [ ] T001 Initialize Next.js project structure
- [ ] T002 Install dependencies (`bullmq`, `ioredis`, `@prisma/client`, `zod`, `twilio`, `zeptomail`, `onesignal-node`)
- [ ] T003 Configure environment variables (`.env`) for Neon, Upstash, and providers

## Phase 2: Foundational

- [ ] T004 [P] Create Prisma schema in `prisma/schema.prisma`
- [ ] T005 [P] Run Prisma migration to Neon
- [ ] T006 [P] Initialize Redis/BullMQ connection utility in `src/infrastructure/queue/bullmq.ts`

## Phase 3: User Story 1 (US1) - Enqueue Notifications

**Goal**: Enable system services to enqueue notification requests with durability and idempotency.
**Test Criteria**: API returns 201 for new requests, record exists in Neon, and job exists in Redis.

- [ ] T007 [P] [US1] Create Notification type definitions in `src/domain/entities/notification.ts`
- [ ] T010 [US1] Create `EnqueueNotification` use case logic in `src/application/use-cases/enqueue-notification.ts`
- [ ] T011 [US1] Implement Next.js API route in `src/app/api/notifications/enqueue/route.ts`

## Phase 4: User Story 2 (US2) - Audit Trail and Debugging

**Goal**: Track every attempt and allow history retrieval for debugging.
**Test Criteria**: Every attempt creates a log entry; API returns logs for a specific notification ID.

- [ ] T012 [P] [US2] Create NotificationLog type definitions in `src/domain/entities/notification-log.ts`
- [ ] T013 [US2] Update data access layer to handle log persistence in `src/infrastructure/database/prisma-repository.ts`
- [ ] T015 [US2] Implement audit log API route in `src/app/api/notifications/[id]/logs/route.ts`

## Phase 5: Core Processing & Providers

**Goal**: Execute the notifications via external providers following the strategy pattern.

- [ ] T016 [P] Implement ZeptoMail provider in `src/infrastructure/providers/email-zeptomail.ts`
- [ ] T017 [P] Implement Twilio SMS provider in `src/infrastructure/providers/sms-twilio.ts`
- [ ] T018 [P] Implement OneSignal Push provider in `src/infrastructure/providers/push-onesignal.ts`
- [ ] T019 Implement BullMQ worker processor logic in `src/workers/processor.ts`
- [ ] T020 [P] Create standalone worker entry point in `src/workers/main-worker.ts`

## Phase 6: Polish & Coordination

- [ ] T021 Configure npm scripts for worker execution in `package.json`
- [ ] T022 Update `README.md` with setup and execution instructions

## Dependencies

- Phase 2 depends on Phase 1 completion.
- US1 (Phase 3) depends on Phase 2 (DB & Queue setup).
- US2 (Phase 4) depends on US1 (Ingestion).
- Phase 5 depends on US1 and US2 being ready for status updates.

## Parallel Execution Examples

- T004, T006 (Phase 2)
- T016, T017, T018 (Phase 5)
- T007, T012 can be defined together.
