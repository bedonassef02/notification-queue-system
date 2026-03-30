# Tasks: Advanced Queue Features

**Input**: Design documents from `/specs/006-advanced-queue-features/`
**Prerequisites**: [plan.md](file:///C:/Users/Bedo/.gemini/antigravity/brain/68761626-210c-467c-a917-c03e01aa56cb/implementation_plan.md) (required), [spec.md](file:///c:/Users/Bedo/Desktop/next.js/specs/006-advanced-queue-features/spec.md) (required for user stories)

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and data model updates that block all user stories.

- [ ] T001 Update `prisma/schema.prisma` with `priority` and `scheduledAt` fields in `Notification` model
- [ ] T002 [P] Run `npx prisma migrate dev --name add_advanced_queue_fields` to update database
- [ ] T003 [P] Update `src/domain/entities/notification.ts` with new interface fields
- [ ] T004 Refactor `src/infrastructure/queue/instance.ts` to support provider-specific queues (`EMAIL_QUEUE`, `SMS_QUEUE`, `PUSH_QUEUE`)
- [ ] T005 [P] Update `src/infrastructure/queue/producer.ts` to route jobs to correct queues and support `delay`/`priority` options

---

## Phase 2: User Story 1 - Time-Sensitive Delivery Control (Priority: P1) 🎯 MVP

**Goal**: Support for delayed notifications and priority-based ordering.
**Independent Test**: Enqueue a HIGH priority job and a DELAYED job; verify execution order.

- [ ] T006 [P] [US1] Update `EnqueueNotificationSchema` in `src/shared/validators/notification-validator.ts` to allow `priority` and `scheduledAt`
- [ ] T007 [US1] Implement scheduling logic in `NotificationService` (`src/application/services/notification-service.ts`) to calculate delay
- [ ] T008 [US1] Update `NotificationRepository` to persist the new fields
- [ ] T009 [US1] Verify worker (`src/workers/processor.ts`) correctly processes priority and delayed jobs

---

## Phase 3: User Story 2 - Provider Load Management (Priority: P2)

**Goal**: Configure and enforce per-provider rate limits.
**Independent Test**: Send 100 notifications and verify provider-specific rate limits are respected.

- [ ] T010 [P] [US2] Update environment configuration for provider rate limits (e.g., `SMS_MAX_LIMIT`, `EMAIL_MAX_LIMIT`)
- [ ] T011 [US2] Update `src/workers/main-worker.ts` to initialize separate workers for each queue with specific `limiter` settings
- [ ] T012 [US2] Add rate limit monitoring logs to `LoggingService`

---

## Phase 4: User Story 3 - Robust Failure Handling (DLQ) (Priority: P2)

**Goal**: Track results of permanently failed jobs.
**Independent Test**: Exhaust retries for a job and verify it is accessible via DLQ check.

- [ ] T013 [P] [US3] Implement `findDeadLetters()` in `src/infrastructure/database/log-repository.ts`
- [ ] T014 [US3] Add a DLQ lookup method to `NotificationService` for ingestion into future API endpoints
- [ ] T015 [US3] (Optional) Create a simple management API for DLQ retries if Q1 is answered 'A'

---

## Phase 5: User Story 4 - Data Integrity (Idempotency) (Priority: P3)

**Goal**: Prevent duplicate enqueues for the same idempotency key.
**Independent Test**: Send duplicate requests and verify only one job is created.

- [ ] T016 [US4] Refactor `NotificationService.create()` to check for existing unsent notifications with the same `idempotencyKey` before enqueuing
- [ ] T017 [US4] Verify BullMQ `jobId` fallback in `producer.ts` handles race conditions gracefully

---

## Phase 6: Polish & Verification

- [ ] T018 Code cleanup and removal of legacy `main-job-queue` references
- [ ] T019 Update `PROJECT_OVERVIEW.md` with the new multi-queue architecture
- [ ] T020 Final end-to-end verification of all advanced features

---

## Implementation Strategy

### MVP First
Complete **Phase 1** and **Phase 2** to deliver Scheduling + Priority. This provides immediate value for time-sensitive alerts.

### Incremental Delivery
Phases 3, 4, and 5 can follow independently once the foundation is solid.
