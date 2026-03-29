# NotifyFlow: Project Overview & Architecture

NotifyFlow is a production-grade, asynchronous notification distribution system built on the **Clean Architecture** principles. This document provides a deep dive into the system's design, file organization, and data lifecycle.

---

## 1. System Mission
NotifyFlow is designed to handle high volumes of notifications (Email, SMS, Push) with **guaranteed durability** and **operational visibility**. By decoupling the notification *intent* (API call) from the notification *execution* (Worker), we ensure the main application remains responsive regardless of provider latency.

---

## 2. Core Architecture
The system is divided into four distinct layers following Clean Architecture:

1.  **Domain Layer** (`src/domain`): Contains stable business rules and entities. It has no dependencies on external libraries (like Prisma or BullMQ).
2.  **Application Layer** (`src/application`): Implements the system use cases (e.g., "Enqueue a Notification"). It orchestrates the flow of data to and from the other layers.
3.  **Infrastructure Layer** (`src/infrastructure`): Handles all external concerns—database persistence (Prisma), queue management (BullMQ), and provider integrations (Twilio, ZeptoMail, OneSignal).
4.  **Presentation/Entry Layer** (`src/app` & `src/workers`): The entry points for the system—either via HTTP requests or background worker tasks.

---

## 3. Component Interaction
- **Producer (Next.js API)**: Validates incoming requests and persists them as `PENDING` records in Neon PostgreSQL, then pushes a job reference into Upstash Redis.
- **Queue (BullMQ)**: Manages state and retries. Upstash Redis ensures the queue survives worker crashes.
- **Consumer (Standalone Worker)**: Monitors the queue, fetches the full notification data from PostgreSQL, and executes the delivery via the appropriate external provider.

---

## 4. Standalone Queue System
While the notification system is the primary use case, the infrastructure in `src/infrastructure/queue/` provides a generalized pattern for any background task.
- **Producer**: Type-safe `enqueueJob` wrapper with built-in Zod validation.
- **Idempotency**: Enforced by mapping business IDs to the `jobId` parameter in BullMQ.
- **Infrastructure**: Optimized IORedis singleton with TLS support for Upstash.

## 5. Detailed File Structure

```text
/
├── prisma/
│   └── schema.prisma           # Relational data model (PostgreSQL)
│
├── src/
│   ├── domain/
│   │   ├── entities/           # Pure TS objects (Notification, Log)
│   │   └── repositories/       # Strategy interfaces for providers/data
│   │
│   ├── application/
│   │   └── use-cases/          # The "Verbs" of the system (Enqueue, GetLogs)
│   │
│   ├── infrastructure/
│   │   ├── database/           # Prisma client and repository implementations
│   │   ├── queue/              # BullMQ connection and queue setup
│   │   └── providers/          # Logic for Twilio, ZeptoMail, OneSignal APIs
│   │
│   ├── app/                    # Next.js App Router
│   │   └── api/                # HTTP Endpoints (Producers)
│   │
│   ├── workers/                # Background Processing
│   │   ├── processor.ts        # The execution logic for jobs
│   │   └── main-worker.ts      # Entry point for the long-running worker
│   │
│   └── shared/                 # Config, utilities, and global types (if any)
```

---

## 5. Data Lifecycle
1. **INGRESS**: An external service calls `POST /api/notifications/enqueue`.
2. **PERSISTENCE**: The `EnqueueNotificationUseCase` creates a record in `notifications` with a status of `PENDING`.
3. **QUEUEING**: A job is added to BullMQ. The job payload contains **only** the `notificationId` to ensure the worker always fetches the most up-to-date state from the DB.
4. **PROCESSING**: The worker picks up the job and updates the DB record to `PROCESSING`.
5. **EXECUTION**: Direct API call to a provider (e.g., Twilio).
6. **FINALIZATION**:
   - **SUCCESS**: Status set to `SENT`. A `NotificationLog` is created for auditing.
   - **FAILURE**: Status returns to `FAILED`. BullMQ initiates exponential backoff and retries (up to 3 times).

---

## 6. Key Reliability Features
- **Idempotency**: Using `idempotencyKey` to prevent the same event from triggering double notifications.
- **Retries**: 10s, 20s, 40s... exponential backoff strategy is enforced.
- **Observability**: Every single send attempt is logged with full provider metadata for troubleshooting.
- **Decoupling**: Adding a new communication channel (like WhatsApp or Slack) only requires adding one file in `src/infrastructure/providers`.
