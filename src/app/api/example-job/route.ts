// src/app/api/example-job/route.ts
import { NextResponse } from 'next/server';
import { enqueueJob } from '@/infrastructure/queue/producer';
import { ZodError } from 'zod';
import { ApiResponse } from '@/shared/utils/api-response';

/**
 * Example endpoint to submit a background job.
 * Demonstrates basic payload validation and the enqueuing flow.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Demonstrate ingestion
    const result = await enqueueJob('process-transaction', {
      id: body.transactionId || `txn-${Date.now()}`, // Business key for idempotency
      name: 'Stripe Payment Ingestion',
      data: {
        amount: body.amount || 0,
        currency: body.currency || 'USD',
      },
    });

    return ApiResponse.success(
      { jobId: result.id },
      201,
      'Successfully enqueued task in BullMQ'
    );
  } catch (err: any) {
    if (err instanceof ZodError) {
      return ApiResponse.validationError(err);
    }

    return ApiResponse.error(
      err.message || 'Queue Submission Error',
      500
    );
  }
}
