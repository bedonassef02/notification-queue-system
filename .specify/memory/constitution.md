# NotifyFlow Constitution

<!-- Project: Production-Ready Notification Queue System for Next.js -->

## Core Principles

### I. Queue-First Durability

All notifications MUST be enqueued before processing. No provider API calls should happen during the request-response cycle of the public API. This ensures durability and minimizes latency for user-facing actions.

### II. Provider Abstraction

External service providers (ZeptoMail, Twilio, OneSignal) MUST be masked behind domain-level interfaces. This prevents vendor lock-in and allows the infrastructure to evolve without modifying business logic.

### III. Immutable Audit Logging

Every state transition of a notification (Pending → Processing → Sent/Failed) MUST be recorded in Neon PostgreSQL. Audit logs are non-negotiable for debugging, accounting, and system health monitoring.

### IV. Isolated Worker Execution

The processing unit (Worker) MUST remain functionally independent from the API surface. This allows for horizontal scaling of workers and prevents processing spikes from impacting the availability of the web application.

### V. Defensive Failure Recovery

All failures MUST trigger a standardized retry policy with exponential backoff. Jobs that exceed the retry limit MUST be moved to a Dead Letter Queue (DLQ) for manual triage, ensuring zero-loss operations.

## Architecture Governance

All architectural changes must follow the Clean Architecture layers defined in the Implementation Plan. Direct communication from the API layer to External Providers is strictly prohibited.

## Development Workflow

Features must follow the Spec-First workflow, ensuring a technical design is approved before implementation begins.

## Governance

This constitution is the ultimate source of truth for NotifyFlow architectural decisions. Amendments require a version bump and an update to the Sync Impact Report.

**Version**: 1.0.0 | **Ratified**: 2026-03-29 | **Last Amended**: 2026-03-29

<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
