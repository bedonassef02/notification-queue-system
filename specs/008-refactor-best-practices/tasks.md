# Tasks: Code Quality and Performance Refactoring

**Input**: Design documents from `/specs/008-refactor-best-practices/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. (Not explicitly requested, but recommended for validation).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create tests directory structure at repository root (tests/unit, tests/integration, tests/e2e)
- [X] T002 [P] Install Vitest dependencies (@vitest/ui, @testing-library/react, supertest) and add to package.json
- [X] T003 [P] Create vitest.config.ts with test environment, coverage settings, and setup files
- [X] T004 [P] Create tests/setup.ts file for global test configuration and utilities

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create custom error classes in src/shared/errors/error-handler.ts (AppError, ValidationError, NotFoundError)
- [X] T006 [P] Implement structured logging utility in src/shared/utils/logger.ts (info, error, performance tracking)
- [X] T007 [P] Create environment variable validation schema in src/shared/validators/env-validator.ts using Zod
- [X] T008 [P] Create shared type definitions in src/types/index.ts (NotificationType, NotificationStatus, etc.)
- [X] T009 [P] Create repository interfaces in src/domain/repositories/inotification-repository.ts and ilog-repository.ts
- [X] T010 [P] Create global error handler utility in src/shared/utils/error-handler.ts
- [X] T011 [P] Update Prisma schema in prisma/schema.prisma with connection pooling configuration
- [X] T012 [P] Run npm audit and remove unused dependencies from package.json
- [X] T013 [P] Remove unused imports and dead code across all source files

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Productivity and Code Maintainability (Priority: P1) 🎯 MVP

**Goal**: Enable developers to quickly understand, modify, and extend the system without introducing bugs.

**Independent Test**: New developer can add a new notification provider within 15 minutes without touching core system logic.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Create unit test for Notification entity in tests/unit/domain/entities/notification.test.ts
- [ ] T015 [P] [US1] Create unit test for NotificationLog entity in tests/unit/domain/entities/notification-log.test.ts
- [ ] T016 [P] [US1] Create unit test for repository interfaces in tests/unit/domain/repositories/repository-interfaces.test.ts

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create Notification entity in src/domain/entities/notification.ts with TypeScript types and validation
- [ ] T018 [P] [US1] Create NotificationLog entity in src/domain/entities/notification-log.ts with TypeScript types and validation
- [ ] T019 [US1] Implement NotificationRepository in src/infrastructure/database/repositories/notification-repository.ts using Prisma
- [ ] T020 [US1] Implement LogRepository in src/infrastructure/database/repositories/log-repository.ts using Prisma
- [ ] T021 [US1] Create NotificationService in src/application/services/notification-service.ts with business logic
- [ ] T022 [US1] Create QueueService in src/application/services/queue-service.ts for BullMQ management
- [ ] T023 [US1] Update provider factory in src/infrastructure/providers/factory.ts with proper type safety
- [ ] T024 [US1] Update email provider in src/infrastructure/providers/email-zeptomail.ts with error handling
- [ ] T025 [US1] Update SMS provider in src/infrastructure/providers/sms-twilio.ts with error handling
- [ ] T026 [US1] Update push provider in src/infrastructure/providers/push-onesignal.ts with error handling

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - System Performance and Scalability (Priority: P1)

**Goal**: Handle increasing loads efficiently without performance degradation as user base grows.

**Independent Test**: System can handle 1,000 concurrent notification requests with response times <500ms for 90% of requests.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US2] Create performance test for API endpoints in tests/integration/api/performance.test.ts
- [ ] T028 [P] [US2] Create load test for worker processing in tests/integration/worker/load.test.ts

### Implementation for User Story 2

- [ ] T029 [P] [US2] Update Prisma queries in NotificationRepository with query batching
- [ ] T030 [P] [US2] Add composite indexes to Prisma schema for recipient/status and createdAt fields
- [ ] T031 [US2] Implement Redis caching utility in src/infrastructure/queue/cache.ts
- [ ] T032 [US2] Add caching layer to NotificationService with 5-minute TTL
- [ ] T033 [US2] Update queue connection in src/infrastructure/queue/connection.ts with connection pooling
- [ ] T034 [US2] Update queue producer in src/infrastructure/queue/producer.ts with rate limiting support
- [ ] T035 [US2] Update worker processor in src/workers/processor.ts with performance tracking
- [ ] T036 [US2] Update main worker in src/workers/main-worker.ts with graceful shutdown and resource cleanup

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Code Quality and Bug Prevention (Priority: P2)

**Goal**: Comprehensive error handling, input validation, and automated testing to catch bugs early.

**Independent Test**: System returns clear error messages without crashing when invalid data or provider failures occur.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T037 [P] [US3] Create integration test for error handling in tests/integration/api/error-handling.test.ts
- [ ] T038 [P] [US3] Create unit test for validation schemas in tests/unit/shared/validators/notification-validator.test.ts
- [ ] T039 [P] [US3] Create unit test for error classes in tests/unit/shared/errors/error-handler.test.ts

### Implementation for User Story 3

- [ ] T040 [P] [US3] Create Zod validation schemas in src/shared/validators/notification-validator.ts
- [ ] T041 [US3] Update NotificationService with comprehensive try-catch and error propagation
- [ ] T042 [US3] Update API routes with global error handler integration in src/app/api/notifications/enqueue/route.ts
- [ ] T043 [US3] Update API routes with global error handler integration in src/app/api/notifications/[id]/logs/route.ts
- [ ] T044 [US3] Update API routes with global error handler integration in src/app/api/dlq/route.ts
- [ ] T045 [US3] Add request validation to all API routes using Zod schemas
- [ ] T046 [US3] Implement retry logic with exponential backoff in worker processor
- [ ] T047 [US3] Add structured logging to all service methods with performance tracking

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Code Reusability and Extensibility (Priority: P2)

**Goal**: Add new notification providers or modify existing ones without changing core system logic.

**Independent Test**: New notification provider (e.g., WhatsApp) integrates without modifying domain or application layers.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T048 [P] [US4] Create unit test for provider factory in tests/unit/infrastructure/providers/factory.test.ts
- [ ] T049 [P] [US4] Create integration test for adding new provider in tests/integration/infrastructure/providers/extension.test.ts

### Implementation for User Story 4

- [ ] T050 [P] [US4] Update provider interface in src/domain/repositories/inotification-repository.ts
- [ ] T051 [US4] Refactor provider factory in src/infrastructure/providers/factory.ts for easier extension
- [ ] T052 [US4] Centralize validation logic in src/shared/validators/notification-validator.ts
- [ ] T053 [US4] Extract common provider patterns into shared utilities in src/infrastructure/providers/shared/
- [ ] T054 [US4] Update routing logic in worker processor to use factory pattern consistently
- [ ] T055 [US4] Create provider documentation template in src/infrastructure/providers/PROVIDER_TEMPLATE.md

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Configure ESLint rules in .eslintrc.json with Next.js and TypeScript configurations
- [ ] T057 [P] Configure Prettier formatting in .prettierrc with project-specific rules
- [ ] T058 [P] Setup Husky pre-commit hooks for linting, formatting, and type checking
- [ ] T059 [P] Add performance monitoring utilities in src/shared/utils/performance.ts
- [ ] T060 [P] Create metrics dashboard queries and API endpoints
- [ ] T061 [P] Update API documentation with error codes and response formats
- [ ] T062 [P] Update developer onboarding guide in DEVELOPER_GUIDE.md with new architecture
- [ ] T063 Run test suite and achieve 80% coverage for critical business logic paths
- [ ] T064 Run performance validation with load testing to verify <200ms p95 response times
- [ ] T065 Update AGENTS.md with new technologies and architecture patterns
- [ ] T066 Final code cleanup and removal of any remaining dead code or unused files
- [ ] T067 Validate quickstart.md by following setup instructions end-to-end
- [ ] T068 Run npm run lint and npm run type-check to ensure zero errors and warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase.
  - US1 (P1) is the MVP and should be completed first.
  - US2 and US3 can proceed once US1 core is stable.
  - US4 can proceed in parallel with US3 after US1 and US2.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 (Setup)
- T005, T006, T007, T008, T009, T010, T011, T012, T013 (Foundational)
- T014, T015, T016 (US1 Tests)
- T017, T018, T023, T024, T025, T026 (US1 Implementation - different files)
- T027, T028 (US2 Tests)
- T029, T030, T031, T032, T033, T034, T035, T036 (US2 Implementation - different files)
- T037, T038, T039 (US3 Tests)
- T040, T041, T042, T043, T044, T045, T046, T047 (US3 Implementation - different files)
- T048, T049 (US4 Tests)
- T050, T051, T052, T053, T054, T055 (US4 Implementation - different files)
- T056, T057, T058, T059, T060, T061, T062 (Polish - different files)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit test for Notification entity in tests/unit/domain/entities/notification.test.ts"
Task: "Create unit test for NotificationLog entity in tests/unit/domain/entities/notification-log.test.ts"
Task: "Create unit test for repository interfaces in tests/unit/domain/repositories/repository-interfaces.test.ts"

# Launch all entity models for User Story 1 together:
Task: "Create Notification entity in src/domain/entities/notification.ts"
Task: "Create NotificationLog entity in src/domain/entities/notification-log.ts"

# Launch all providers for User Story 1 together:
Task: "Update provider factory in src/infrastructure/providers/factory.ts"
Task: "Update email provider in src/infrastructure/providers/email-zeptomail.ts"
Task: "Update SMS provider in src/infrastructure/providers/sms-twilio.ts"
Task: "Update push provider in src/infrastructure/providers/push-onesignal.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Verify new developer can add notification provider within 15 minutes

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Developer Productivity) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Performance) → Test independently → Deploy/Demo
4. Add US3 (Code Quality) → Test independently → Deploy/Demo
5. Add US4 (Extensibility) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Developer Productivity)
   - Developer B: User Story 2 (Performance)
   - Developer C: User Story 3 (Code Quality)
3. Developer D joins for User Story 4 (Extensibility)
4. Stories complete and integrate independently
5. Final Polish Phase completed by all developers together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests should fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
