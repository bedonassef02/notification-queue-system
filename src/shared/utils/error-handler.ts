import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError
} from '../errors/error-handler'
import { logger } from './logger'

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error occurred', error)

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten().fieldErrors
      },
      { status: 400 }
    )
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.errors
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof RateLimitError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  )
}

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler()
    return result as NextResponse
  } catch (error) {
    return handleApiError(error)
  }
}