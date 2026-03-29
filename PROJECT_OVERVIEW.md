# NotifyFlow: Project Overview & Architecture

NotifyFlow is a production-grade, asynchronous notification distribution system. It follows a modular architecture designed for high throughput and maintainability.

---

## 1. System Mission
NotifyFlow acts as a centralized brain for notification delivery. It decouples the API ingestion from the actual delivery process using BullMQ, ensuring that provider latency does not affect the main application performance.

---

## 2. Core Architecture
The system is built on a **Service-Oriented Design**:

1.  **Presentation Layer** (`src/app/api`): Acts as thin controllers that validate HTTP requests and delegate to services.
2.  **Domain Layer** (`src/domain`): Pure business logic and entity definitions (Notification, Status, Type).
3.  **Application Layer** (`src/application/services`): Orchestrates business logic, such as creating notifications and managing their lifecycle.
4.  **Shared Layer** (`src/shared`): Contains universal utilities like the `ApiResponse` wrapper and Zod validators.
5.  **Infrastructure Layer** (`src/infrastructure`): Implements specialized external logic:
    - `database/`: Granular repositories for partitioned data access.
    - `queue/`: BullMQ/Redis singleton infrastructure.
    - `providers/`: Strategy-based notification channel implementations.

---

## 3. Data Flow
1. **INGRESS**: `/api/notifications/enqueue` is called.
2. **ORCHESTRATION**: `NotificationService.create()` validates input using a shared validator.
3. **PERSISTENCE**: `NotificationRepository.upsert()` saves the record as `PENDING`.
4. **QUEUEING**: `enqueueJob()` pushes the notification ID to BullMQ.
5. **EXECUTION**: A background worker picks up the job, fetches the data, and uses the `ProviderFactory` to send the message.

---

## 4. File Structure (Simplified)

```text
src/
├── app/api/                # API Controller Routes
├── application/
│   └── services/           # Orchestration Logic (create, findAll)
├── domain/
│   └── entities/           # Pure entities and enums
├── infrastructure/
│   ├── database/           # specialized repositories (Notification, Log)
│   ├── queue/              # Redis singletons
│   └── providers/          # Provider strategy implementation
├── shared/
│   ├── validators/         # Centralized Zod schemas
│   └── utils/              # Universal response helpers
└── workers/                # Background job processors
```

---

## 5. Reliability & Security
- **Idempotency**: business keys map to BullMQ `jobId` to avoid double-sends.
- **Observability**: Every send attempt is recorded in the `LogRepository`.
- **Validation**: Strict schema enforcement at the service entry point.
l provider metadata for troubleshooting.
- **Decoupling**: Adding a new communication channel (like WhatsApp or Slack) only requires adding one file in `src/infrastructure/providers`.
