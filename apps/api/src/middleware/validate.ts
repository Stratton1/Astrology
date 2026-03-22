import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Factory that returns a middleware validating req.body against the provided
 * Zod schema. On success, req.body is replaced with the parsed (and
 * potentially transformed) value. On failure a 400 response is sent with
 * detailed Zod error information.
 */
export function validate<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error: ZodError = result.error;
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
          requestId: req.id ?? 'unknown',
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

/**
 * Factory that validates req.query against the provided Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const error: ZodError = result.error;
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
          requestId: req.id ?? 'unknown',
        },
      });
      return;
    }

    // Attach typed query to request
    (req as Request & { parsedQuery: T }).parsedQuery = result.data;
    next();
  };
}
