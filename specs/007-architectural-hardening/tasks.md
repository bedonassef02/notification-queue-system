# Tasks: Architectural Hardening

**Input**: Design documents from `/specs/007-architectural-hardening/`
**Prerequisites**: [plan.md](file:///C:/Users/Bedo/.gemini/antigravity/brain/68761626-210c-467c-a917-c03e01aa56cb/implementation_plan.md) (required), [spec.md](file:///c:/Users/Bedo/Desktop/next.js/specs/007-architectural-hardening/spec.md) (required for user stories)

## Phase 1: Shared Infrastructure (Foundational) ✅ COMPLETE

- [x] T001 Create `src/shared/utils/config.ts` with Zod validation for all environment variables
- [x] T002 [P] Create `src/shared/utils/application-error.ts` with `AppError` and specialized subclasses
- [x] T003 [P] Create `src/domain/entities/payloads.ts` with channel-specific interfaces (Email, SMS, Push)

---

## Phase 2: Dependency Injection Foundation (Priority: P1) ✅ COMPLETE

- [x] T004 Refactor `src/infrastructure/providers/factory.ts` to support pre-configured provider instances (Manual Registry)
- [x] T005 [P] Update `src/infrastructure/providers/email-zeptomail.ts` to accept validated `AppConfig`
- [x] T006 [P] Update `src/infrastructure/providers/sms-twilio.ts` to accept validated `AppConfig`
- [x] T007 [P] Update `src/infrastructure/providers/push-onesignal.ts` to accept validated `AppConfig`

---

## Phase 3: Service & Repository Layer (Priority: P1) ✅ COMPLETE

- [x] T008 Refactor `src/application/services/logging-service.ts` to use constructor injection for `LogRepository`
- [x] T009 Refactor `src/application/services/notification-service.ts` to use constructor injection for all dependencies

---

## Phase 4: API & Presentation Hardening (Priority: P2) ✅ COMPLETE

- [x] T010 Update `src/app/api/notifications/enqueue/route.ts` to use enhanced error handling and service injection
- [x] T011 [P] Standardize error handling in `src/app/api/notifications/[id]/logs/route.ts`
- [x] T012 [P] Standardize error handling in `src/app/api/notifications/dlq/route.ts`

---

## Phase 5: Worker Hardening (Priority: P2) ✅ COMPLETE

- [x] T013 Implement secondary payload validation inside the `NotificationProcessor`
- [x] T014 Standardize worker-level logging for infrastructure failures

---

## Phase 6: Polish & Verification ✅ COMPLETE

- [x] T015 Verify "fail-fast" behavior by removing a required env key (Manual - Success)
- [x] T016 Run final verification tests (Code synced)
