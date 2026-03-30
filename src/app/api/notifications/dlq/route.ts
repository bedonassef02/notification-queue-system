// src/app/api/notifications/dlq/route.ts
import { NextResponse } from 'next/server';
import { NotificationService } from '@/application/services/notification-service';

/**
 * GET /api/notifications/dlq
 * Retrieves all notifications that have reached a PERMANENT_FAILURE state.
 * This acts as the inspection endpoint for the Dead Letter Queue.
 */
export async function GET() {
  try {
    const service = new NotificationService();
    const deadLetters = await service.getDeadLetters();

    return NextResponse.json({
      success: true,
      count: deadLetters.length,
      data: deadLetters,
    });
  } catch (error: any) {
    console.error('Failed to fetch DLQ:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
