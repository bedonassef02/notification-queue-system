# Contracts: BullMQ Queue System

## 1. Job Input Contract
A generic job payload for the system:

```typescript
type JobPayload = {
  id: string;      // Used as BullMQ jobId for idempotency
  data: any;       // Actual data for the job
  timestamp: Date; // Creation time
}
```

## 2. Producer Interface
The capability to add a job to the queue gracefully.

```typescript
interface IJobProducer {
  /**
   * Enqueues a job into the managed queue.
   */
  enqueue(
    name: string, 
    jobData: JobPayload, 
    options?: JobOptions
  ): Promise<Job>;
}
```

## 3. Options Specification
Standard options for every job:
- `attempts`: 3
- `backoff`: { type: 'exponential', delay: 10000 }
- `removeOnComplete`: true
- `jobId`: jobData.id (Mandatory for idempotency)
