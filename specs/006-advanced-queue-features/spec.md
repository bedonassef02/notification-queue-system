# Feature Specification: Advanced Queue Features

**Feature Branch**: `006-advanced-queue-features`  
**Created**: 2026-03-30  
**Status**: Draft  
**Input**: User description: "Enhance the notification queue system with advanced production features. Add: Dead Letter Queue, Scheduled jobs, Priority queue support, Rate limiting per provider, Idempotency handling."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Time-Sensitive Delivery Control (Priority: P1)

As a system administrator, I want to schedule notifications for a future time and assign them priorities so that critical alerts (like 2FA) are delivered immediately while marketing messages are sent later.

**Why this priority**: High. Scheduling and priority are fundamental for managing different types of communication without overloading the system or providers.

**Independent Test**: Enqueue a "High Priority" job and a "Delayed" job simultaneously; verify the High Priority job processes immediately while the Delayed job waits for its target timestamp.

**Acceptance Scenarios**:

1. **Given** a notification request with a `delay` of 1 hour, **When** enqueued, **Then** it remains in the queue and only processes after 1 hour.
2. **Given** two notifications enqueued at the same time, **When** one has `priority: high` and the other `priority: low`, **Then** the high priority one is processed first.

---

### User Story 2 - Provider Load Management (Priority: P2)

As a developer, I want to limit the rate of notifications sent to a specific provider so that we don't hit their API limits or get blocked.

**Why this priority**: Medium. Protects the system from being throttled by external vendors and ensures long-term reliability.

**Independent Test**: Enqueue 100 notifications for a provider with a rate limit of 10 per minute; verify that total delivery takes at least 10 minutes.

**Acceptance Scenarios**:

1. **Given** a provider-specific rate limit of 1 per second, **When** 5 notifications are enqueued, **Then** they are delivered at least 1 second apart.

---

### User Story 3 - Robust Failure Handling (DLQ) (Priority: P2)

As an operations engineer, I want notifications that exceed their retry limit to be moved to a Dead Letter Queue instead of disappearing, so I can manually intervene.

**Why this priority**: Medium. Ensures no data loss even in the worst-case failure scenarios.

**Independent Test**: Simulate a persistent provider error for a notification; verify that after 5 retries, the notification status becomes `PERMANENT_FAILURE` and is accessible in the DLQ view.

**Acceptance Scenarios**:

1. **Given** a notification that fails 5 times, **When** the 6th attempt is reached, **Then** it is marked as `PERMANENT_FAILURE` and no more retries occur.

---

### User Story 4 - Data Integrity (Idempotency) (Priority: P3)

As a client application, I want to send the same notification multiple times with a unique key and have it processed only once, to avoid duplicate charges or spam.

**Why this priority**: Medium-Low. Prevents common integration bugs and improves user experience.

**Independent Test**: Send two requests with the same `idempotencyKey` within a short window; verify only one notification is sent.

**Acceptance Scenarios**:

1. **Given** an existing notification with key `KEY_123`, **When** a new request arrives with key `KEY_123`, **Then** the second request returns the existing notification and does not enqueue a new job.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support a `scheduledAt` timestamp in the ingestion API to delay delivery.
- **FR-002**: System MUST support `priority` levels (e.g., High, Medium, Low) for job ordering.
- **FR-003**: System MUST implement a Dead Letter Queue (DLQ) pattern for notifications that exhaust all retries.
- **FR-004**: System MUST allow configuring rate limits (jobs per unit of time) on a per-provider basis.
- **FR-005**: System MUST enforce idempotency based on a client-provided `idempotencyKey` to prevent duplicate delivery.
- **FR-006**: System MUST provide a way to retry or purge jobs currently in the DLQ. [NEEDS CLARIFICATION: Is a manual retry API required, or just logging?]

### Key Entities

- **Notification**: Expands to include `priority`, `scheduledAt`, and `providerMetadata`.
- **RateLimitConfig**: New entity to store provider-specific limits (e.g., `providerType`, `maxJobs`, `duration`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Critical (High Priority) messages bypass any lower-priority backlog within 5 seconds.
- **SC-002**: Provider API rate limits are never exceeded during peak load (0% "Too Many Requests" errors from providers).
- **SC-003**: 100% of permanently failed jobs are captured in the DLQ with full error context.
- **SC-004**: System detects and prevents 100% of duplicate enqueues for requests with the same `idempotencyKey` within a 24-hour window.

## Assumptions

- [Assumption 1]: BullMQ's built-in delay and priority features will be the primary mechanism for FR-001 and FR-002.
- [Assumption 2]: Rate limiting will be enforced at the worker/queue level, not the API level.
- [Assumption 3]: Validations for `idempotencyKey` will rely on an indexed unique constraint in the database.
- [Assumption 4]: "Provider" refers to the type (Email, SMS, Push) for rate limiting defaults, but can be overridden per account if needed.
