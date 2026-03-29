# Implementation Plan: Notification Database Schema

**Branch**: `001-notification-db-schema` | **Date**: 2026-03-29 | **Spec**: [spec.md](file:///c:/Users/Bedo/Desktop/next.js/specs/001-notification-db-schema/spec.md)
**Input**: Feature specification from `/specs/001-notification-db-schema/spec.md`

## Summary

The objective is to implement a robust, production-ready PostgreSQL schema for a notification queue system. The approach involves using two main tables: `notifications` for current state and metadata, and `notification_logs` for a detailed audit trail of all delivery attempts. The system will leverage UUIDs for distributed safety, JSONB for flexible payloads, and partial indexing to ensure high-performance polling for the queue workers.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+ (Next.js 14 App Router environment)  
**Primary Dependencies**: `bullmq`, `ioredis`, `@prisma/client`, `zod`  
**Storage**: Neon (PostgreSQL) for audit/persistence, Upstash (Redis) for queueing  
**Testing**: Vitest / Jest  
**Target Platform**: Node.js / Vercel / Railway / Fly.io  
**Project Type**: Next.js Web Application + Background Worker  
**Performance Goals**: Support 1,000+ notifications enqueued/sec; polling latency < 10ms  
**Constraints**: 3 retries max with exponential backoff; strict idempotency required  
**Scale/Scope**: Initial support for Email (ZeptoMail), SMS (Twilio), and Push (OneSignal)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Rationale |
| :--- | :--- | :--- |
| **I. Queue-First Durability** | ✅ PASS | All notifications are persisted to the DB and enqueued to Redis before processing begins. |
| **II. Provider Abstraction** | ✅ PASS | Infrastructure providers are masked behind domain-level interfaces in the design. |
| **III. Immutable Audit Logging** | ✅ PASS | Every state change is recorded in the `notification_logs` table. |
| **IV. Isolated Worker Execution** | ✅ PASS | Worker processing is decoupled from the user-facing Next.js API. |
| **V. Defensive Failure Recovery** | ✅ PASS | Exponential backoff and a 3-retry limit are baked into the schema requirements. |

## Project Structure

The project follows a Clean Architecture approach to maintain separation between domain logic and infrastructure.

```text
src/
├── domain/              # Entities and Repository interfaces
│   ├── entities/        # Notification, NotificationLog
│   └── repositories/    # INotificationRepository
├── application/         # Use Cases
│   └── use-cases/       # EnqueueNotification, ProcessNotification
├── infrastructure/      # Implementation details
│   ├── database/        # Prisma/Neon implementation
│   ├── queue/           # BullMQ implementation
│   └── providers/       # ZeptoMail, Twilio, OneSignal implementations
├── app/                 # Next.js App Router (Views and API)
│   └── api/notif/       # Enqueue and Webhook endpoints
└── workers/             # Standalone Worker scripts
    └── main-worker.ts   # Entry point for the BullMQ processor
```

**Structure Decision**: Clean Architecture (Single Project) chosen to ensure the core notification logic remains provider-agnostic and testable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations detected)*
