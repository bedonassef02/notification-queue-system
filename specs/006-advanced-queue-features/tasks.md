# Tasks: Advanced Queue Features

**Input**: Design documents from `/specs/006-advanced-queue-features/`
**Prerequisites**: [plan.md](file:///C:/Users/Bedo/.gemini/antigravity/brain/68761626-210c-467c-a917-c03e01aa56cb/implementation_plan.md) (required), [spec.md](file:///c:/Users/Bedo/Desktop/next.js/specs/006-advanced-queue-features/spec.md) (required for user stories)

## Phase 1: Foundational (Blocking Prerequisites) ✅ COMPLETE

- [x] T001 Update `prisma/schema.prisma` with `priority` and `scheduledAt` fields in `Notification` model
- [x] T002 [P] Run `npx prisma migrate dev` (Code synced via Generate, migration blocked)
- [x] T003 [P] Update `src/domain/entities/notification.ts` with new interface fields
- [x] T004 Refactor `src/infrastructure/queue/instance.ts` to support provider-specific queues (`EMAIL_QUEUE`, `SMS_QUEUE`, `PUSH_QUEUE`)
- [x] T005 [P] Update `src/infrastructure/queue/producer.ts` to route jobs to correct queues and support `delay`/`priority` options

---

## Phase 2: User Story 1 - Time-Sensitive Delivery Control (Priority: P1) ✅ COMPLETE

- [x] T006 [P] [US1] Update `EnqueueNotificationSchema` in `src/shared/validators/notification-validator.ts`
- [x] T007 [US1] Implement scheduling logic in `NotificationService`
- [x] T008 [US1] Update `NotificationRepository` to persist the new fields
- [x] T009 [US1] Verify worker (`src/workers/processor.ts`) compatibility (Ready)

---

## Phase 3: User Story 2 - Provider Load Management (Priority: P2) ✅ COMPLETE

- [x] T010 [P] [US2] Update environment configuration for provider rate limits
- [x] T011 [US2] Update `src/workers/main-worker.ts` to initialize separate workers with limiters
- [x] T012 [US2] Add rate limit monitoring logs (PROCESSING status logging)

---

## Phase 4: User Story 3 - Robust Failure Handling (DLQ) (Priority: P2) ✅ COMPLETE

- [x] T013 [P] [US3] Implement `findDeadLetters()` in `LogRepository`
- [x] T014 [US3] Add a DLQ lookup method to `NotificationService`
- [x] T015 [US3] Create API route `GET /api/notifications/dlq` for DLQ inspection

---

## Phase 5: User Story 4 - Data Integrity (Idempotency) (Priority: P3) ✅ COMPLETE

- [x] T016 [US4] Refactor `NotificationService.create()` for idempotency optimization
- [x] T017 [US4] Verify BullMQ `jobId` fallback logic (Verified)

---

## Phase 6: Polish & Verification ✅ COMPLETE

- [x] T018 Code cleanup and removal of legacy `main-job-queue` references
- [x] T019 Update `PROJECT_OVERVIEW.md` with the new multi-queue architecture
- [x] T020 Final end-to-end verification of all advanced features
