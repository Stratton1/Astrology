import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { logger } from '../lib/logger';
import { enqueueSynthesisJob } from '../lib/queue';
import { cacheGet, cacheSet } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { TraditionSchema } from '@cosmos/types';

const router = Router();

// All synthesis routes require authentication
router.use(authenticate);

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const GenerateSynthesisSchema = z.object({
  chartId: z.string().uuid('Invalid chart ID'),
  tradition: TraditionSchema,
});

// ─── Cache helpers ──────────────────────────────────────────────────────────

const SYNTHESIS_CACHE_TTL = 3600; // 1 hour

function synthesisCacheKey(id: string): string {
  return `synthesis:${id}`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/synthesis
 * Trigger an AI synthesis for a given chart.
 * Creates a Synthesis record in "pending" state and enqueues a BullMQ job.
 */
router.post(
  '/',
  validate(GenerateSynthesisSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { chartId, tradition } = req.body as z.infer<typeof GenerateSynthesisSchema>;

    try {
      // Verify the chart exists and belongs to the authenticated user
      const chart = await prisma.chart.findUnique({
        where: { id: chartId },
        include: {
          profile: { select: { userId: true } },
        },
      });

      if (!chart) {
        next(createError('Chart not found', 404, 'NOT_FOUND'));
        return;
      }

      if (chart.profile.userId !== req.userId) {
        next(createError('Access denied', 403, 'FORBIDDEN'));
        return;
      }

      // Check for existing completed synthesis for this chart + tradition
      const existing = await prisma.synthesis.findFirst({
        where: {
          chartId,
          tradition,
          status: 'completed',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        res.json({
          synthesis: {
            id: existing.id,
            chartId: existing.chartId,
            tradition: existing.tradition,
            status: existing.status,
            content: existing.content,
            model: existing.model,
            tokensUsed: existing.tokensUsed,
            error: existing.error,
            createdAt: existing.createdAt.toISOString(),
            completedAt: existing.completedAt?.toISOString() ?? null,
          },
          message: 'Existing synthesis returned.',
          cached: true,
        });
        return;
      }

      // Check for pending/processing synthesis
      const inProgress = await prisma.synthesis.findFirst({
        where: {
          chartId,
          tradition,
          status: { in: ['pending', 'processing'] },
        },
      });

      if (inProgress) {
        res.status(202).json({
          synthesis: {
            id: inProgress.id,
            chartId: inProgress.chartId,
            tradition: inProgress.tradition,
            status: inProgress.status,
            createdAt: inProgress.createdAt.toISOString(),
          },
          message: 'Synthesis already in progress. Poll GET /api/v1/synthesis/:id for status.',
        });
        return;
      }

      // Create a pending synthesis record
      const synthesis = await prisma.synthesis.create({
        data: {
          chartId,
          tradition,
          status: 'pending',
        },
      });

      logger.info(
        { userId: req.userId, synthesisId: synthesis.id, chartId, tradition },
        'Synthesis requested'
      );

      // Enqueue BullMQ job
      const jobId = await enqueueSynthesisJob({
        synthesisId: synthesis.id,
        chartId,
        tradition,
        calculatedData: chart.calculatedData,
      });

      if (!jobId) {
        // Queue unavailable — mark as failed
        await prisma.synthesis.update({
          where: { id: synthesis.id },
          data: {
            status: 'failed',
            error: 'Synthesis queue unavailable. Please try again later.',
            completedAt: new Date(),
          },
        });

        next(createError('Synthesis service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE'));
        return;
      }

      res.status(202).json({
        synthesis: {
          id: synthesis.id,
          chartId: synthesis.chartId,
          tradition: synthesis.tradition,
          status: synthesis.status,
          createdAt: synthesis.createdAt.toISOString(),
        },
        message: 'Synthesis queued. Poll GET /api/v1/synthesis/:id for status.',
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/synthesis/:id
 * Retrieve a synthesis by ID.
 * Verifies ownership through the associated chart → profile.
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };

    try {
      // Check cache first for completed syntheses
      const cached = await cacheGet(synthesisCacheKey(id));
      if (cached) {
        res.json({ synthesis: JSON.parse(cached) });
        return;
      }

      const synthesis = await prisma.synthesis.findUnique({
        where: { id },
        include: {
          chart: {
            include: {
              profile: { select: { userId: true } },
            },
          },
        },
      });

      if (!synthesis) {
        next(createError('Synthesis not found', 404, 'NOT_FOUND'));
        return;
      }

      if (synthesis.chart.profile.userId !== req.userId) {
        next(createError('Access denied', 403, 'FORBIDDEN'));
        return;
      }

      const result = {
        id: synthesis.id,
        chartId: synthesis.chartId,
        tradition: synthesis.tradition,
        status: synthesis.status,
        content: synthesis.content,
        model: synthesis.model,
        tokensUsed: synthesis.tokensUsed,
        error: synthesis.error,
        createdAt: synthesis.createdAt.toISOString(),
        completedAt: synthesis.completedAt?.toISOString() ?? null,
      };

      // Cache completed syntheses
      if (synthesis.status === 'completed') {
        await cacheSet(synthesisCacheKey(id), JSON.stringify(result), SYNTHESIS_CACHE_TTL);
      }

      res.json({ synthesis: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/synthesis
 * List all synthesis records for charts owned by the authenticated user.
 * Optionally filter by chartId query parameter.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const chartId = typeof req.query['chartId'] === 'string' ? req.query['chartId'] : undefined;

    try {
      const syntheses = await prisma.synthesis.findMany({
        where: {
          ...(chartId ? { chartId } : {}),
          chart: {
            profile: { userId: req.userId },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({
        syntheses: syntheses.map((s) => ({
          id: s.id,
          chartId: s.chartId,
          tradition: s.tradition,
          status: s.status,
          content: s.content,
          model: s.model,
          tokensUsed: s.tokensUsed,
          error: s.error,
          createdAt: s.createdAt.toISOString(),
          completedAt: s.completedAt?.toISOString() ?? null,
        })),
        total: syntheses.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

export { router as synthesisRouter };
