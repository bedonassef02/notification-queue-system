# NotifyFlow: Production-Ready Notification Queue System

A robust, modular notification system built with **Next.js (App Router)**, **BullMQ**, **Upstash (Redis)**, and **Neon (PostgreSQL)**.

## Core Features

- **Durable Enqueuing**: All notifications are persisted to PostgreSQL before queuing.
- **Provider Strategy**: Easy-to-extend system for Email (ZeptoMail), SMS (Twilio), and Push (OneSignal).
- **Asynchronous Processing**: Background workers handle all delivery tasks to minimize API latency.
- **Standalone Queue System**: A generalized BullMQ infrastructure for extending to any background tasks.
- **Audit Logs**: Full history of every delivery attempt (Success/Failure) for every notification.
- **Exactly-Once Protection**: Idempotency keys prevent duplicate notifications for the same event.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon (PostgreSQL) + Prisma
- **Queue**: Upstash Redis + BullMQ
- **Language**: TypeScript

## Getting Started

### 1. Prerequisites

- A **Neon** database instance.
- An **Upstash Redis** instance.
- API keys for ZeptoMail, Twilio, or OneSignal.

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your `DATABASE_URL`, `UPSTASH_REDIS_URL`, and relevant provider credentials.

### 3. Installation

```bash
npm install
npx prisma generate
npx prisma db push
```

### 4. Running the System

**Start the Web API:**

```bash
npm run dev
```

**Start the Notification Worker:**

```bash
npm run worker:start
```

## API Reference

### Enqueue Notification

`POST /api/notifications/enqueue`

```json
{
  "type": "EMAIL",
  "recipient": "user@example.com",
  "payload": {
    "subject": "Welcome!",
    "body": "Thank you for joining NotifyFlow."
  },
  "idempotencyKey": "unique_event_id"
}
```

### Fetch Audit History

`GET /api/notifications/[id]/logs`

## Project Structure

- `src/domain`: Entities and core business rules.
- `src/application/services`: Orchestration Logic (NotificationService).
- `src/infrastructure/database`: specialized repositories (Notification, Log).
- `src/infrastructure/providers`: Strategy-based notification channel implementations (ZeptoMail, Twilio, OneSignal).
- `src/infrastructure/queue`: IORedis/BullMQ singleton infrastructure.
- `src/shared/validators`: Centralized Zod schemas.
- `src/workers`: Background job processors.
- `src/app/api`: Thin controllers for handling HTTP requests.
