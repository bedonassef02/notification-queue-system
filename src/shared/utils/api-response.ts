// src/shared/utils/api-response.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standardized API Response utility to reduce boilerplate in Next.js routes.
 */
export class ApiResponse {
  static success(data: any, status: number = 200, message: string = "Success") {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status },
    );
  }

  static error(message: string, status: number = 500, details?: any) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        details: details || null,
      },
      { status },
    );
  }

  static validationError(error: ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation Error",
        details: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
}
