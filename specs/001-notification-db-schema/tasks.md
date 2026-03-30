# Tasks: Notification Database Schema

**Branch**: `001-notification-db-schema` | **Date**: 2026-03-29 | **Plan**: [plan.md](file:///c:/Users/Bedo/Desktop/next.js/specs/001-notification-db-schema/plan.md)

## Implementation Strategy

We follow the **MVP First** strategy. Phase 3 (US1) establishes the core ingestion capability. Phase 4 (US2) completes the auditing requirements. Phase 5 handles the actual execution and integration with external providers.

## Phase 1: Setup

- [x] T001 Initialize Next.js project structure
- [x] T002 Install dependencies (`bullmq`, `ioredis`, `@prisma/client`, `zod`, `twilio`, `zeptomail`, `onesignal-node`)
- [x] T003 Configure environment variables (`.env`) for Neon, Upstash, and providers

## Phase 2: Foundational

- [x] T004 [P] Create Prisma schema in `prisma/schema.prisma`
- [ ] T005 [P] Run Prisma migration to Neon
- [x] T006 [P] Initialize Redis/BullMQ connection utility in `src/infrastructure/queue/bullmq.ts`

## Phase 3: User Story 1 (US1) - Enqueue Notifications

**Goal**: Enable system services to enqueue notification requests with durability and idempotency.
**Test Criteria**: API returns 201 for new requests, record exists in Neon, and job exists in Redis.

- [x] T007 [P] [US1] Create Notification type definitions in `src/domain/entities/notification.ts`
- [x] T010 [US1] Create `EnqueueNotification` use case logic in `src/application/use-cases/enqueue-notification.ts`
- [x] T011 [US1] Implement Next.js API route in `src/app/api/notifications/enqueue/route.ts`

## Phase 4: User Story 2 (US2) - Audit Trail and Debugging

**Goal**: Track every attempt and allow history retrieval for debugging.
**Test Criteria**: Every attempt creates a log entry; API returns logs for a specific notification ID.

- [x] T012 [P] [US2] Create NotificationLog type definitions in `src/domain/entities/notification-log.ts`
- [x] T013 [US2] Update data access layer to handle log persistence in `src/infrastructure/database/prisma-repository.ts`
- [x] T015 [US2] Implement audit log API route in `src/app/api/notifications/[id]/logs/route.ts`

## Phase 5: Core Processing & Providers

**Goal**: Execute the notifications via external providers following the strategy pattern.

- [x] T016 [P] Implement ZeptoMail provider in `src/infrastructure/providers/email-zeptomail.ts`
- [x] T017 [P] Implement Twilio SMS provider in `src/infrastructure/providers/sms-twilio.ts`
- [x] T018 [P] Implement OneSignal Push provider in `src/infrastructure/providers/push-onesignal.ts`
- [x] T019 Implement BullMQ worker processor logic in `src/workers/processor.ts`
- [x] T020 [P] Create standalone worker entry point in `src/workers/main-worker.ts`

## Phase 6: Polish & Coordination

- [x] T021 Configure npm scripts for worker execution in `package.json`
- [x] T022 Update `README.md` with setup and execution instructions

## Dependencies

- Phase 2 depends on Phase 1 completion.
- US1 (Phase 3) depends on Phase 2 (DB & Queue setup).
- US2 (Phase 4) depends on US1 (Ingestion).
- Phase 5 depends on US1 and US2 being ready for status updates.

## Parallel Execution Examples

- T004, T006 (Phase 2)
- T016, T017, T018 (Phase 5)
- T007, T012 can be defined together.
