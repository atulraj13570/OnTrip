import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "./requestLogger";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (
  err: Error | ZodError | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.id || "unknown";

  // Zod validation error
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        statusCode: 400,
        details: { errors },
      },
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }

  // API error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }

  // Unexpected error
  logger.error("Unexpected error", {
    request_id: requestId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
    request_id: requestId,
  });
};
