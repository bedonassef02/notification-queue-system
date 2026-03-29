# Quickstart: Notification Worker Processor

This guide describes how to run and test the asynchronous notification worker locally.

## 1. Setup Environment

Ensure your `.env` file contains the required connection URLs for Redis and PostgreSQL:

```bash
DATABASE_URL="postgresql://user:pass@ep-host.neon.tech/notifyflow?sslmode=require"
UPSTASH_REDIS_URL="rediss://default:pass@host.upstash.io:6379"
```

## 2. Generate Prisma Client

```bash
npx prisma generate
```

## 3. Run the Worker

Execute the following script to start the standalone Node.js process:

```bash
npm run worker:start
```

## 4. Test Enqueuing

Use **Thunder Client** or `curl` to hit the enqueue endpoint:

```bash
curl -X POST http://localhost:3000/api/notifications/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EMAIL",
    "recipient": "user@example.com",
    "payload": {
      "subject": "Quickstart Test",
      "body": "Testing the asynchronous worker."
    }
  }'
```

## 5. Verify Delivery

- **Console Out**: Observe the job being picked up and processed by the worker.
- **Database**: Check `notification_logs` table in Neon to verify the attempt record.
