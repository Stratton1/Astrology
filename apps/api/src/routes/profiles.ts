import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { encrypt, decrypt } from '../lib/encryption';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { BirthDataSchema } from '@cosmos/types';

const router = Router();
const prisma = new PrismaClient();

// All profile routes require authentication
router.use(authenticate);

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const CreateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  birthData: BirthDataSchema,
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  birthData: BirthDataSchema.optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function encryptBirthData(birthData: z.infer<typeof BirthDataSchema>): string {
  return encrypt(JSON.stringify(birthData), config.encryptionKey);
}

function decryptBirthData(encryptedData: string): z.infer<typeof BirthDataSchema> {
  const plaintext = decrypt(encryptedData, config.encryptionKey);
  return JSON.parse(plaintext) as z.infer<typeof BirthDataSchema>;
}

function formatProfile(profile: {
  id: string;
  userId: string;
  name: string;
  encryptedBirthData: string;
  locationName: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name,
    birthData: decryptBirthData(profile.encryptedBirthData),
    locationName: profile.locationName,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/profiles
 * List all profiles for the authenticated user.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profiles = await prisma.profile.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        profiles: profiles.map(formatProfile),
        total: profiles.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/profiles
 * Create a new profile for the authenticated user.
 */
router.post(
  '/',
  validate(CreateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, birthData } = req.body as z.infer<typeof CreateProfileSchema>;

    try {
      const encryptedBirthData = encryptBirthData(birthData);

      const profile = await prisma.profile.create({
        data: {
          userId: req.userId!,
          name,
          encryptedBirthData,
          locationName: birthData.locationName,
        },
      });

      logger.info({ userId: req.userId, profileId: profile.id }, 'Profile created');

      res.status(201).json({ profile: formatProfile(profile) });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/profiles/:id
 * Get a specific profile (must be owned by the authenticated user).
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };

    try {
      const profile = await prisma.profile.findUnique({ where: { id } });

      if (!profile) {
        next(createError('Profile not found', 404, 'NOT_FOUND'));
        return;
      }

      if (profile.userId !== req.userId) {
        next(createError('Access denied', 403, 'FORBIDDEN'));
        return;
      }

      res.json({ profile: formatProfile(profile) });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/v1/profiles/:id
 * Update a profile (must be owned by the authenticated user).
 */
router.put(
  '/:id',
  validate(UpdateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };
    const updates = req.body as z.infer<typeof UpdateProfileSchema>;

    try {
      const existing = await prisma.profile.findUnique({ where: { id } });

      if (!existing) {
        next(createError('Profile not found', 404, 'NOT_FOUND'));
        return;
      }

      if (existing.userId !== req.userId) {
        next(createError('Access denied', 403, 'FORBIDDEN'));
        return;
      }

      const data: {
        name?: string;
        encryptedBirthData?: string;
        locationName?: string;
      } = {};

      if (updates.name !== undefined) {
        data.name = updates.name;
      }

      if (updates.birthData !== undefined) {
        data.encryptedBirthData = encryptBirthData(updates.birthData);
        data.locationName = updates.birthData.locationName;
      }

      const profile = await prisma.profile.update({
        where: { id },
        data,
      });

      logger.info({ userId: req.userId, profileId: id }, 'Profile updated');

      res.json({ profile: formatProfile(profile) });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/v1/profiles/:id
 * Delete a profile (must be owned by the authenticated user).
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };

    try {
      const existing = await prisma.profile.findUnique({ where: { id } });

      if (!existing) {
        next(createError('Profile not found', 404, 'NOT_FOUND'));
        return;
      }

      if (existing.userId !== req.userId) {
        next(createError('Access denied', 403, 'FORBIDDEN'));
        return;
      }

      await prisma.profile.delete({ where: { id } });

      logger.info({ userId: req.userId, profileId: id }, 'Profile deleted');

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export { router as profilesRouter };
