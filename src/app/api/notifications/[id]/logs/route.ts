// src/app/api/notifications/[id]/logs/route.ts
import { NextResponse } from 'next/server';
import { PrismaRepository } from '@/infrastructure/database/prisma-repository';

const prismaRepository = new PrismaRepository();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    
    // 1. Check if the notification exists
    const notification = await prismaRepository.getNotificationById(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // 2. Fetch logs
    const logs = await prismaRepository.getLogsByNotificationId(notificationId);
    
    return NextResponse.json(
      {
        id: notification.id,
        type: notification.type,
        status: notification.status,
        attempts: notification.attempts,
        logs: logs
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit Log API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
