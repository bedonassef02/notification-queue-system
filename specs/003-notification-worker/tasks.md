# Tasks: Notification Worker Processor

**Input**: Design documents from `/specs/003-notification-worker/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. (Not explicitly requested, but recommended for validation).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize worker directory structure in src/workers/
- [x] T002 Verify ESM configuration and scripts in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Ensure Redis connection singleton is accessible in src/infrastructure/queue/connection.ts
- [x] T004 Ensure BullMQ Queue instance is accessible in src/infrastructure/queue/instance.ts
- [x] T005 [P] Create shared job validation schema in src/shared/validators/job-validator.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Multi-Channel Asynchronous Delivery (Priority: P1) 🎯 MVP

**Goal**: Automatically process notification jobs from a queue and deliver them via Email, SMS, or Push channels.

**Independent Test**: Enqueue a job via API and verify the worker picks it up and successfully calls the provider.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create NotificationProcessor class skeleton in src/workers/processor.ts
- [x] T007 [P] [US1] Implement provider routing logic using factory in src/workers/processor.ts
- [x] T008 [US1] Implement the send execution logic in src/workers/processor.ts
- [x] T009 [US1] Initialize and start the BullMQ Worker in src/workers/main-worker.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Resilient State Management & Auditing (Priority: P2)

**Goal**: Update database status and log every delivery attempt.

**Independent Test**: Verify that the database shows PROCESSING then SENT/FAILED status, and notification_logs contains the entry.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement status update to PROCESSING at start in src/workers/processor.ts
- [x] T011 [P] [US2] Implement success logging and SENT status update in src/workers/processor.ts
- [x] T012 [P] [US2] Implement failure logging and FAILED status update in src/workers/processor.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Idempotency & Duplicate Prevention (Priority: P3)

**Goal**: Ensure a notification is never sent twice even on retries.

**Independent Test**: Mark a notification as SENT in DB, enqueue a job, and verify the worker skips processing.

### Implementation for User Story 3

- [x] T013 [US3] Implement status pre-check logic in src/workers/processor.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 [P] Implement graceful shutdown (SIGTERM/SIGINT) in src/workers/main-worker.ts
- [x] T015 Perform code cleanup and optimize imports across src/workers/
- [x] T016 Run and validate quickstart.md local development flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase.
  - US1 (P1) is the MVP and should be completed first.
  - US2 and US3 can proceed once US1 core is stable.

### Parallel Opportunities

- T005 (Foundational) can run in parallel with T003 and T004.
- T006, T007 (US1) can run in parallel before merging into the main processor logic.
- T010, T011, T012 (US2) involve different logic blocks in the same file but can be developed incrementally.
- T014 (Polish) can be developed independently of the core processor logic.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational.
2. Complete US1 (Core Processing).
3. **STOP and VALIDATE**: Verify end-to-end delivery of a single notification type.

### Incremental Delivery

1. Add US2 (Auditing & Logging) to provide visibility.
2. Add US3 (Idempotency) to ensure production safety.
3. Finalize with Polish (Graceful shutdowns).

---

## Phase 7: Dockerization (Container Orchestration)

**Purpose**: Standardize the development and deployment environments for the app and worker.

- [x] T017 [P] Create .dockerignore in project root
- [x] T018 [P] Create Dockerfile for the Next.js application
- [x] T019 [P] Create Dockerfile.worker for the notification worker processor
- [x] T020 [P] Create docker-compose.yml for local development (App + Worker + Redis)
- [x] T021 Validate containerized worker connectivity to Redis and DB
