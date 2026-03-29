# Feature Specification: Notification Database Schema

**Feature Branch**: `001-notification-db-schema`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "Design a PostgreSQL schema for a notification queue system with notifications and logs tables, tracking type, recipient, payload, status, and attempts."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enqueue and Track Notifications (Priority: P1)
As a system service, I want to persist notification requests in a durable database so that they can be processed asynchronously without data loss.

**Why this priority**: Core functionality. Without persistence, the queue system cannot guarantee delivery or recovery from crashes.

**Independent Test**: Verify that a notification record can be inserted with a JSON payload and retrieved by its unique ID.

**Acceptance Scenarios**:
1. **Given** a valid notification request (email, recipient, payload), **When** enqueued, **Then** a record is created in the `notifications` table with status `PENDING`.
2. **Given** an enqueued notification, **When** queried by recipient, **Then** the correct payload and status are returned.

---

### User Story 2 - Audit Trail and Debugging (Priority: P2)
As a developer or support agent, I want to see the full history of every attempt to send a notification so that I can troubleshoot delivery failures.

**Why this priority**: Essential for operational reliability and customer support.

**Independent Test**: Trigger multiple send attempts for a single notification and verify that each attempt creates a corresponding entry in the `notification_logs` table.

**Acceptance Scenarios**:
1. **Given** a notification that failed its first attempt, **When** retried, **Then** a new log entry is created with the error message and the `notifications` table `attempts` count increments.
2. **Given** a specific notification ID, **When** fetching logs, **Then** all historical attempts are returned in chronological order.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support three notification types: `EMAIL`, `SMS`, and `PUSH`.
- **FR-002**: System MUST store the recipient identifier (email address, phone number, or device token).
- **FR-003**: System MUST store the notification payload as a structured JSON object to accommodate varied provider requirements.
- **FR-004**: System MUST track the current lifecycle status: `PENDING`, `PROCESSING`, `SENT`, `FAILED`, and `PERMANENT_FAILURE`.
- **FR-005**: System MUST record the number of delivery attempts made for each notification.
- **FR-006**: System MUST maintain high-precision timestamps for `created_at`, `updated_at`, and `last_attempt_at`.
- **FR-007**: System MUST support an idempotency key to prevent duplicate notification creation for the same event.

### Key Entities *(include if feature involves data)*

- **Notification**: The root entity representing a message intent. Includes current state and configuration.
- **NotificationLog**: A child entity representing a single execution attempt. Stores provider-specific feedback and error details.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database schema supports inserting 1,000 notifications per second on standard hardware.
- **SC-002**: Querying for the next "ready-to-process" notification takes less than 10ms with 1 million records in the table.
- **SC-003**: Full audit history for a single notification ID can be retrieved in under 5ms.
- **SC-004**: The schema enforces data integrity through foreign keys and check constraints (no orphaned logs).

## Assumptions

- **A-001**: UUID v4 will be used for primary keys to allow for distributed generation and merging.
- **A-002**: The system handles high-volume JSON payloads; hence `JSONB` is used for efficient indexing and storage.
- **A-003**: Old notification logs and metadata will be archived or purged by a separate process after 30 days to maintain performance.
