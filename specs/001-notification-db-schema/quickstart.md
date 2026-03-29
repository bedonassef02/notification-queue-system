# Quickstart: Notification System

## 1. Database Setup
1.  Initialize Prisma or Drizzle with the schema defined in `data-model.md`.
2.  Deploy the migrations to **Neon (PostgreSQL)**.
3.  Configure environment variables for Neon and **Upstash (Redis)**.

```bash
DATABASE_URL="postgresql://user:pass@ep-rest-of-url.neon.tech/neondb"
UPSTASH_REDIS_URL="rediss://default:token@region.upstash.io:6379"
```

## 2. Enqueueing a Notification
Call the Next.js API route `/api/notifications/enqueue` or use the `NotificationService`.

```typescript
const notification = await notificationService.enqueue(
  NotificationType.EMAIL,
  'user@example.com',
  { templateId: 'welcome-email', user: 'Bedo' }
);
```

## 3. Running the Worker
The worker processes notifications from the BullMQ queue asynchronously.

```bash
# Start the standalone worker
npm run worker:start
```

## 4. Retries
BullMQ will automatically retry failed jobs with exponential backoff (up to 3 times) before marking the database record as `PERMANENT_FAILURE`.
