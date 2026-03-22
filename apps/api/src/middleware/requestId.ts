import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Attaches a UUID request ID to each incoming request.
 * Re-uses the X-Request-ID header if already present (e.g. from a proxy).
 * Always echoes the ID back in the response X-Request-ID header.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'];
  const id =
    typeof existingId === 'string' && existingId.length > 0
      ? existingId
      : uuidv4();

  req.id = id;
  res.setHeader('X-Request-ID', id);

  next();
}
