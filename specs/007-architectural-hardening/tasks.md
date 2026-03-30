# Tasks: Architectural Hardening

**Input**: Design documents from `/specs/007-architectural-hardening/`
**Prerequisites**: [plan.md](file:///C:/Users/Bedo/.gemini/antigravity/brain/68761626-210c-467c-a917-c03e01aa56cb/implementation_plan.md) (required), [spec.md](file:///c:/Users/Bedo/Desktop/next.js/specs/007-architectural-hardening/spec.md) (required for user stories)

## Phase 1: Shared Infrastructure (Foundational) ✅ BLOCKS ALL USERS

**Purpose**: Core utilities and types used across the application.

- [ ] T001 Create `src/shared/utils/config.ts` with Zod validation for all environment variables
- [ ] T002 [P] Create `src/shared/utils/application-error.ts` with `AppError` and specialized subclasses
- [ ] T003 [P] Create `src/domain/entities/payloads.ts` with channel-specific interfaces (Email, SMS, Push)

---

## Phase 2: Dependency Injection Foundation (Priority: P1)

**Goal**: Establish the injection pattern for providers and repositories.

- [ ] T004 Refactor `src/infrastructure/providers/factory.ts` to support pre-configured provider instances (Manual Registry)
- [ ] T005 [P] Update `src/infrastructure/providers/email-zeptomail.ts` to accept validated `AppConfig`
- [ ] T006 [P] Update `src/infrastructure/providers/sms-twilio.ts` to accept validated `AppConfig`
- [ ] T007 [P] Update `src/infrastructure/providers/push-onesignal.ts` to accept validated `AppConfig`

---

## Phase 3: Service & Repository Layer (Priority: P1)

**Goal**: Decouple services from their concrete data-access dependencies.

- [ ] T008 Refactor `src/application/services/logging-service.ts` to use constructor injection for `LogRepository`
- [ ] T009 Refactor `src/application/services/notification-service.ts` to use constructor injection for all dependencies

---

## Phase 4: API & Presentation Hardening (Priority: P2)

**Goal**: Ensure consistent error responses and service instantiation.

- [ ] T010 Update `src/app/api/notifications/enqueue/route.ts` to use enhanced error handling and service injection
- [ ] T011 [P] Standardize error handling in `src/app/api/notifications/[id]/logs/route.ts`
- [ ] T012 [P] Standardize error handling in `src/app/api/notifications/dlq/route.ts`

---

## Phase 5: Worker Hardening (Priority: P2)

**Goal**: Improve queue reliability and processing safety.

- [ ] T013 Implement secondary payload validation inside the `NotificationProcessor`
- [ ] T014 Standardize worker-level logging for infrastructure failures

---

## Phase 6: Polish & Verification

- [ ] T015 Verify "fail-fast" behavior by removing a required env key
- [ ] T016 Run final verification tests for ingestion and delivery flows
