import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { config } from '../lib/config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

function buildErrorEnvelope(
  code: string,
  message: string,
  requestId: string,
  details?: unknown
): ErrorEnvelope {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      requestId,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = String(req.id ?? 'unknown');
  const isProduction = config.nodeEnv === 'production';

  // Zod validation errors
  if (err instanceof ZodError) {
    res
      .status(400)
      .json(
        buildErrorEnvelope(
          'VALIDATION_ERROR',
          'Request validation failed',
          requestId,
          err.errors
        )
      );
    return;
  }

  const appError = err as AppError;
  const statusCode = appError.statusCode ?? 500;
  const code = appError.code ?? 'INTERNAL_ERROR';
  const message =
    statusCode === 500 && isProduction
      ? 'An internal server error occurred'
      : err.message;

  if (statusCode >= 500) {
    logger.error(
      {
        err: {
          message: err.message,
          code,
          stack: isProduction ? undefined : err.stack,
        },
        requestId,
        method: req.method,
        url: req.url,
      },
      'Unhandled server error'
    );
  } else {
    logger.warn(
      {
        err: { message: err.message, code },
        requestId,
        method: req.method,
        url: req.url,
      },
      'Client error'
    );
  }

  const details =
    !isProduction && appError.details !== undefined
      ? appError.details
      : undefined;

  res.status(statusCode).json(buildErrorEnvelope(code, message, requestId, details));
}

/**
 * Factory to create a typed AppError instance.
 */
export function createError(
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}
