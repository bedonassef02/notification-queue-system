// src/app/api/notifications/enqueue/route.ts
import { NextResponse } from 'next/server';
import { EnqueueNotificationUseCase } from '@/application/use-cases/enqueue-notification';
import { ZodError } from 'zod';
import { PrismaRepository } from '@/infrastructure/database/prisma-repository';
import { ApiResponse } from '@/shared/utils/api-response';

const prismaRepository = new PrismaRepository();
const enqueueNotificationUseCase = new EnqueueNotificationUseCase(prismaRepository);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await enqueueNotificationUseCase.execute(body);

    return ApiResponse.success(
      { id: result.id, status: result.status },
      201,
      'Notification enqueued successfully'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validationError(error);
    }

    return ApiResponse.error(
      (error as Error).message || 'Internal Server Error',
      500
    );
  }
}
