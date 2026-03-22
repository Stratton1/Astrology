import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';

const router = Router();
const prisma = new PrismaClient();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'api',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', async (_req: Request, res: Response) => {
  const checks = {
    database: 'unknown' as 'ok' | 'error' | 'unknown',
    redis: 'unknown' as 'ok' | 'error' | 'unknown',
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    checks.database = 'error';
  }

  // Check Redis connectivity
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch (err) {
    logger.error({ err }, 'Redis health check failed');
    checks.redis = 'error';
  }

  const allHealthy = Object.values(checks).every((v) => v === 'ok');
  const status = allHealthy ? 'ready' : 'degraded';
  const httpStatus = allHealthy ? 200 : 503;

  res.status(httpStatus).json({ status, checks });
});

export { router as healthRouter };
