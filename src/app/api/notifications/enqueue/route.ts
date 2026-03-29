// src/app/api/notifications/enqueue/route.ts
import { NextResponse } from 'next/server';
import { EnqueueNotificationUseCase } from '@/application/use-cases/enqueue-notification';
import { ZodError } from 'zod';

const enqueueNotificationUseCase = new EnqueueNotificationUseCase();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const result = await enqueueNotificationUseCase.execute(body);
    
    return NextResponse.json(
      { 
        id: result.id, 
        status: result.status, 
        message: 'Notification enqueued successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enqueue API Error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          details: error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
