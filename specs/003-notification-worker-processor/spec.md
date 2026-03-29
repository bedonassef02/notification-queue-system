# Feature Specification: Notification Worker Processor

**Feature Branch**: `003-notification-worker-processor`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "Implement a worker processor for handling notification jobs using BullMQ. Requirements: Process job types: email, sms, push. Call appropriate service based on type. Update notification status in DB. Log each attempt (success/failure). Handle retries properly. Ensure idempotency (avoid duplicate sends)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Channel Asynchronous Delivery (Priority: P1)

As a system, I want to automatically process notification jobs from a queue and deliver them via Email, SMS, or Push channels so that the main application remains responsive while high-volume messaging is handled in the background.

**Why this priority**: Core value proposition of the notification system. Enables asynchronous operations.

**Independent Test**: Can be tested by enqueuing a notification job and verifying that the corresponding provider (Mock or Real) receives the payload and the notification status in the database transitions to `SENT`.

**Acceptance Scenarios**:

1. **Given** a notification job of type `EMAIL` in the queue, **When** the worker processes it, **Then** it should use the ZeptoMail provider to send the message.
2. **Given** a notification job of type `SMS` in the queue, **When** the worker processes it, **Then** it should use the Twilio provider to send the message.
3. **Given** a notification job of type `PUSH` in the queue, **When** the worker processes it, **Then** it should use the OneSignal provider to send the message.

---

### User Story 2 - Resilient State Management & Auditing (Priority: P2)

As a developer, I want the system to update the database with the current status of each notification and log every delivery attempt so that I can monitor system health and troubleshoot failures.

**Why this priority**: Essential for observability and reliability.

**Independent Test**: Can be tested by intentionally failing a provider call and verifying that the database shows `FAILED` status and an error entry exists in the audit logs.

**Acceptance Scenarios**:

1. **Given** a job starts processing, **When** the worker begins, **Then** the notification status should be updated to `PROCESSING`.
2. **Given** a successful delivery, **When** the provider returns success, **Then** the notification status should be `SENT` and a success log should be recorded.
3. **Given** a provider failure, **When** an error occurs, **Then** the notification status should remain `FAILED` (or `PROCESSING` if retrying) and an error log with the specific message should be recorded.

---

### User Story 3 - Idempotency & Duplicate Prevention (Priority: P3)

As a system, I want to ensure that a notification is never sent twice to the same recipient for the same request, even if the queue worker restarts or retries the job.

**Why this priority**: Prevents spamming users and incurring unnecessary costs.

**Independent Test**: Can be tested by manually setting a notification to `SENT` in the DB and then enqueuing a job for that same ID; the worker should skip the send.

**Acceptance Scenarios**:

1. **Given** a notification is already marked as `SENT` in the database, **When** a worker picks up a job for that ID, **Then** it should immediately complete without calling the provider.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST process jobs from the `main-job-queue` (BullMQ).
- **FR-002**: System MUST use a factory pattern to select the appropriate provider (Email, SMS, Push) based on job metadata.
- **FR-003**: System MUST update the notification status in Neon (PostgreSQL) using the `NotificationRepository`.
- **FR-004**: System MUST record every attempt (success/fail) in the `LogRepository`.
- **FR-005**: System MUST throw an error when a provider fails to allow BullMQ to handle retries based on the global backoff policy.
- **FR-006**: System MUST perform a pre-processing check on the notification's current status to ensure idempotency.

### Key Entities

- **Notification**: The domain entity representing the intent to send a message.
- **Audit Log**: The record of individual delivery attempts.
- **Provider**: The abstraction for external services (ZeptoMail, Twilio, OneSignal).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid jobs in the queue trigger a provider interaction (or an idempotency skip).
- **SC-002**: Database status reflects the real-world state of the notification within 500ms of job completion.
- **SC-003**: Audit logs contain the precise error message from the provider on failure.
- **SC-004**: Zero duplicate deliveries are made for notifications already marked as `SENT`.

## Assumptions

- **Queue Setup**: BullMQ infrastructure (Producer and Instance) is already implemented and stable.
- **Provider Credentials**: Valid API keys for ZeptoMail, Twilio, and OneSignal are available in environment variables.
- **Runtime**: The worker runs in a Node.js environment compatible with `ts-node-esm`.
