# Tasks: Notification Logging System

## Implementation Strategy

- **MVP First**: Establish the database schema and basic logging service.
- **Incremental Delivery**: Integrate logging into the worker and then expose via API.
- **Verification**: Use Prisma Studio and API calls to confirm log integrity.

## Phase 1: Setup

- [x] T001 Update `prisma/schema.prisma` with `attemptNumber` in `NotificationLog`
- [ ] T002 Generate Prisma Client and run migration using `npx prisma migrate dev --name add_attempt_number_to_logs` (BLOCKED: DATABASE_URL is placeholder)

## Phase 2: Foundational

- [x] T003 Update `src/infrastructure/database/log-repository.ts` to support `attemptNumber` in `create()`
- [x] T004 [P] Update `src/infrastructure/database/notification-repository.ts` to return updated record from `updateStatus()`

## Phase 3: [US1] Core Delivery Logging

**Story Goal**: Track every delivery attempt with status, errors, and metadata.
**Independent Test**: Trigger a notification and verify log entry in DB.

- [x] T005 [P] [US1] Create `src/application/services/logging-service.ts` to centralize audit logging
- [x] T006 [US1] Refactor `src/workers/processor.ts` to use `LoggingService` and track attempts

## Phase 4: [US2] Observability API

**Story Goal**: Expose delivery history via REST API for debugging.
**Independent Test**: `GET /api/notifications/{id}/logs` returns correct attempt history.

- [x] T007 [US2] Update `src/application/services/notification-service.ts` to ensure consistent log retrieval
- [x] T008 [US2] Refactor `src/app/api/notifications/[id]/logs/route.ts` to return structured logs with attempt numbers

## Phase 5: Polish & Verification

- [x] T009 Verify full retry flow with multiple logs in `src/workers/processor.ts` (Logic audit complete)
- [x] T010 Final audit of log structure against requirements in `specs/004-notification-logging-system/quickstart.md` (Complete)

---

## Dependencies

- Phase 1 → Phase 2 → Phase 3 → Phase 4

## Parallel Opportunities

- T004 (Notification Repository) and T005 (Logging Service) can be implemented in parallel.
- T007 and T008 can be started once the Logging Service is stable.
