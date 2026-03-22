import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { logger } from '../lib/logger';
import { TraditionSchema } from '@cosmos/types';

const router = Router();
const prisma = new PrismaClient();

// All synthesis routes require authentication
router.use(authenticate);

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const GenerateSynthesisSchema = z.object({
  chartId: z.string().uuid('Invalid chart ID'),
  tradition: TraditionSchema,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SYNTHESIS_SERVICE_URL =
  process.env['SYNTHESIS_SERVICE_URL'] ?? 'http://localhost:3003';

async function callSynthesisService(payload: {
  synthesisId: string;
  chartId: string;
  tradition: string;
  calculatedData: unknown;
}): Promise<void> {
  // Fire-and-forget: the synthesis service updates the DB record when done
  fetch(`${SYNTHESIS_SERVICE_URL}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5_000),
  }).catch((err: unknown) => {
    logger.error(
      { err, synthesisId: payload.synthesisId },
      'Failed to dispatch synthesis request'
    );
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/synthesis
 * Trigger an AI synthesis for a given chart.
 * Creates a Synthesis record in "pending" state and dispatches to the
 * synthesis microservice asynchronously.
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

      // Dispatch to synthesis service (non-blocking)
      await callSynthesisService({
        synthesisId: synthesis.id,
        chartId,
        tradition,
        calculatedData: chart.calculatedData,
      });

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

      res.json({
        synthesis: {
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
        },
      });
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
