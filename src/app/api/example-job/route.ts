// src/app/api/example-job/route.ts
import { NextResponse } from 'next/server';
import { enqueueJob } from '@/infrastructure/queue/producer';
import { ZodError } from 'zod';

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
    
    return NextResponse.json(
      { 
        jobId: result.id, 
        message: 'Successfully enqueued task in BullMQ' 
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API Error] Enqueue Job Failed:', err);

    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Input Validation Failed', info: err.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Queue Submission Error', message: err.message },
      { status: 500 }
    );
  }
}
