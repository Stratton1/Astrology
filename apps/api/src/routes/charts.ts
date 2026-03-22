import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { cacheGet, cacheSet } from '../lib/redis';
import { logger } from '../lib/logger';
import {
  BirthDataSchema,
  TraditionSchema,
  HouseSystemSchema,
  CoordinateSystemSchema,
  AyanamshaSchema,
} from '@cosmos/types';

const router = Router();
const prisma = new PrismaClient();

// All chart routes require authentication
router.use(authenticate);

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const CalculateChartSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  birthData: BirthDataSchema,
  tradition: TraditionSchema,
  houseSystem: HouseSystemSchema,
  coordinateSystem: CoordinateSystemSchema,
  ayanamsha: AyanamshaSchema.optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CHART_CACHE_TTL = 60 * 60 * 24; // 24 hours
const CALC_SERVICE_URL =
  process.env['CALC_SERVICE_URL'] ?? 'http://localhost:3002';

function buildCacheKey(input: z.infer<typeof CalculateChartSchema>): string {
  const key = JSON.stringify({
    birthData: input.birthData,
    tradition: input.tradition,
    houseSystem: input.houseSystem,
    coordinateSystem: input.coordinateSystem,
    ayanamsha: input.ayanamsha ?? null,
  });
  // Simple deterministic hash using Buffer
  return `chart:calc:${Buffer.from(key).toString('base64url').slice(0, 64)}`;
}

async function callCalcService(
  input: z.infer<typeof CalculateChartSchema>
): Promise<unknown> {
  const response = await fetch(`${CALC_SERVICE_URL}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthData: input.birthData,
      tradition: input.tradition,
      houseSystem: input.houseSystem,
      coordinateSystem: input.coordinateSystem,
      ayanamsha: input.ayanamsha,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw createError(
      `Calculation service error: ${response.statusText}`,
      502,
      'CALC_SERVICE_ERROR',
      { status: response.status, body }
    );
  }

  return response.json();
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/charts/calculate
 * Calculate a natal chart for a given profile and birth data.
 * Results are cached in Redis and persisted to the database.
 */
router.post(
  '/calculate',
  validate(CalculateChartSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const input = req.body as z.infer<typeof CalculateChartSchema>;

    try {
      // Verify profile belongs to authenticated user
      const profile = await prisma.profile.findUnique({
        where: { id: input.profileId },
        select: { id: true, userId: true },
      });

      if (!profile) {
        next(createError('Profile not found', 404, 'NOT_FOUND'));
        return;
      }

      if (profile.userId !== req.userId) {
        next(createError('Access denied', 403, 'FORBIDDEN'));
        return;
      }

      // Check Redis cache
      const cacheKey = buildCacheKey(input);
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.debug({ cacheKey }, 'Chart cache hit');
        const cachedData = JSON.parse(cached) as { chartId: string; data: unknown };

        // Retrieve the persisted chart record
        const existingChart = await prisma.chart.findUnique({
          where: { id: cachedData.chartId },
        });

        if (existingChart) {
          res.json({
            chart: {
              id: existingChart.id,
              profileId: existingChart.profileId,
              tradition: existingChart.tradition,
              chartType: existingChart.chartType,
              coordinateSystem: existingChart.coordinateSystem,
              houseSystem: existingChart.houseSystem,
              ayanamsha: existingChart.ayanamsha,
              calculatedData: existingChart.calculatedData,
              createdAt: existingChart.createdAt.toISOString(),
            },
            cached: true,
          });
          return;
        }
      }

      // Call the calculation microservice
      const calculatedData = await callCalcService(input);

      // Persist to database
      const chart = await prisma.chart.create({
        data: {
          profileId: input.profileId,
          tradition: input.tradition,
          chartType: 'natal',
          coordinateSystem: input.coordinateSystem,
          houseSystem: input.houseSystem,
          ayanamsha: input.ayanamsha ?? null,
          calculatedData: calculatedData as object,
        },
      });

      // Store in Redis cache
      await cacheSet(
        cacheKey,
        JSON.stringify({ chartId: chart.id, data: calculatedData }),
        CHART_CACHE_TTL
      );

      logger.info(
        { userId: req.userId, chartId: chart.id, tradition: input.tradition },
        'Chart calculated and stored'
      );

      res.status(201).json({
        chart: {
          id: chart.id,
          profileId: chart.profileId,
          tradition: chart.tradition,
          chartType: chart.chartType,
          coordinateSystem: chart.coordinateSystem,
          houseSystem: chart.houseSystem,
          ayanamsha: chart.ayanamsha,
          calculatedData: chart.calculatedData,
          createdAt: chart.createdAt.toISOString(),
        },
        cached: false,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/charts/:id
 * Retrieve a chart by ID.
 * Verifies ownership through the associated profile.
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };

    try {
      const chart = await prisma.chart.findUnique({
        where: { id },
        include: {
          profile: {
            select: { userId: true },
          },
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

      res.json({
        chart: {
          id: chart.id,
          profileId: chart.profileId,
          tradition: chart.tradition,
          chartType: chart.chartType,
          coordinateSystem: chart.coordinateSystem,
          houseSystem: chart.houseSystem,
          ayanamsha: chart.ayanamsha,
          calculatedData: chart.calculatedData,
          createdAt: chart.createdAt.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export { router as chartsRouter };
