# Quickstart: Notification Logging

## Verification Workflow

To verify that notification delivery attempts are being logged correctly:

### 1. Trigger a Notification Delivery
You can use the `POST /api/notifications` API endpoint or a custom test script to enqueue a notification.

### 2. Check the Audit Table (Prisma)
You can view the logs in PostgreSQL using Prisma Studio:
```bash
npx prisma studio
```
Look for entries in the `notification_logs` table.

### 3. Fetch Logs via API
You can fetch delivery history for a specific notification:
```bash
GET /api/notifications/{notification_id}/logs
```

### 4. Verify Attempt Numbers
- **Success Case**: A single log entry with `status: SENT` and `attemptNumber: 1`.
- **Failure + Retry Case**: Multiple log entries with `status: FAILED` and incrementing `attemptNumber`.
- **Permanent Failure Case**: Multiple log entries with the final entry having `status: PERMANENT_FAILURE`.

### 5. Error Insight
For failures, check the `errorMessage` and `metadata` (JSON) to understand why the provider rejected the request.
