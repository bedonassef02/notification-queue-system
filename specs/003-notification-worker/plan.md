# Implementation Plan: Notification Worker Processor

**Branch**: `003-notification-worker` | **Date**: 2026-03-29 | **Spec**: [spec.md](file:///c:/Users/Bedo/Desktop/next.js/specs/003-notification-worker/spec.md)
**Input**: Feature specification from `/specs/003-notification-worker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary
Building a robust, standalone notification worker for BullMQ that processes multi-channel delivery (Email, SMS, Push) with full audit logging and exactly-once delivery guarantees.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+ (Next.js 14 App Router environment)  
**Primary Dependencies**: `bullmq`, `ioredis`, `@prisma/client`, `zod`  
**Storage**: Neon PostgreSQL (via Prisma) and Upstash Redis (via BullMQ)  
**Testing**: `npm test`  
**Target Platform**: Linux (for standalone worker) / Vercel (for Next.js API)
**Project Type**: web-service  
**Performance Goals**: <500ms processing overhead per job (excluding provider latency)  
**Constraints**: 3 retry limit with exponential backoff; <1s database write latency  
**Scale/Scope**: Support 10k+ notifications per hour; exactly-once delivery via idempotency keys

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Queue-First**: ✅ (Validated: Service layer enqueues before process)
- **Principle II: Provider Abstraction**: ✅ (Validated: `INotificationProvider` interface ready)
- **Principle III: Audit Logging**: ✅ (Validated: `LogRepository` integrated into processor)
- **Principle IV: Isolated Worker**: ✅ (Validated: `src/workers` directory structure used)
- **Principle V: Defensive Recovery**: ✅ (Validated: BullMQ retries configured in `instance.ts`)

## Project Structure

### Documentation (this feature)

```text
specs/003-notification-worker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── application/
│   └── services/
│       └── notification-service.ts
├── infrastructure/
│   ├── database/
│   │   ├── notification-repository.ts
│   │   └── log-repository.ts
│   ├── providers/
│   │   ├── factory.ts
│   │   └── [provider-implementations].ts
│   └── queue/
│       ├── connection.ts
│       ├── instance.ts
│       └── producer.ts
├── shared/
│   └── validators/
│       └── notification-validator.ts
└── workers/
    ├── main-worker.ts
    └── processor.ts
```

**Structure Decision**: Utilizing a domain-driven architectural layout under `src/`, separating infrastructure (database, providers, queue) from application services and background workers.
