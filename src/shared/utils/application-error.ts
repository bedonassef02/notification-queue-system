// src/shared/utils/application-error.ts
import { ZodError } from 'zod';

export enum ErrorCode {
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
}

/**
 * Base Application Error
 * Every error thrown within the application should inherit from this.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, statusCode: number = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Infrastructure Error
 * For failures related to external services (Redis, database, providers).
 */
export class InfrastructureError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.PROVIDER_ERROR, 502, details);
  }
}

/**
 * Validation Error
 * For schema mismatches or user input issues.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }

  static fromZod(error: ZodError): ValidationError {
    return new ValidationError('Validation Failed', error.issues);
  }
}

/**
 * Domain Error
 * For business logic violations.
 */
export class DomainError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, ErrorCode.INTERNAL_ERROR, statusCode);
  }
}

/**
 * NotFoundError
 * For missing entities.
 */
export class NotFoundError extends AppError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID ${id} not found`, ErrorCode.NOT_FOUND, 404);
  }
}
