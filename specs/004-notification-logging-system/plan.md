# Implementation Plan: Notification Logging System

**Branch**: `main` | **Date**: 2026-03-30 | **Spec**: [User Request]
**Input**: Design a logging system for tracking notification delivery attempts.

## Summary

Implement a robust, immutable audit logging system for notification delivery attempts. This includes tracking attempt counts, success/failure status, error messages, and provider-specific metadata. The system will use a dedicated `LoggingService` to decouple logging logic from the worker processor.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+ (Next.js 14 App Router)  
**Primary Dependencies**: `bullmq`, `ioredis`, `@prisma/client`, `zod`  
**Storage**: PostgreSQL (Neon)  
**Testing**: `npm test`  
**Target Platform**: Node.js / Docker  
**Project Type**: Web Service  
**Performance Goals**: Low latency for log writes, efficient retrieval for debugging.  
**Constraints**: Logs must be immutable and linked to notifications.  
**Scale/Scope**: 100% audit coverage for all delivery attempts.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Queue-First Durability | PASS | Logging occurs within the background worker. |
| II. Provider Abstraction | PASS | Logging processes the response from the provider factory. |
| III. Immutable Audit Logging | PASS | Core purpose of this feature. |
| IV. Isolated Worker Execution | PASS | Logging service will be used by the worker processor. |
| V. Defensive Failure Recovery| PASS | Each retry attempt will be uniquely logged with its attempt number. |

## Project Structure

### Documentation (this feature)

```text
specs/004-notification-logging-system/
├── plan.md              # This file
├── research.md          # Implementation decisions and rationale
├── data-model.md        # Updated NotificationLog schema
├── quickstart.md        # How to use and verify the logging system
└── tasks.md             # Execution steps (Phase 2)
```

### Source Code (repository root)

```text
src/
├── app/api/notifications/[id]/logs/route.ts
├── application/
│   └── services/
│       └── logging-service.ts [NEW]
├── infrastructure/
│   └── database/
│       ├── log-repository.ts
│       └── notification-repository.ts
└── workers/
    └── processor.ts
```

**Structure Decision**: Standard Project Structure as defined in `PROJECT_OVERVIEW.md`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations.*
