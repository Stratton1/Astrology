import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { config } from '../lib/config';
import { logger } from '../lib/logger';

const router = Router();
const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Token helpers ────────────────────────────────────────────────────────────

interface AccessTokenPayload {
  userId: string;
  email: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenType: 'refresh';
}

function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

function generateTokenPair(userId: string, email: string) {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = generateRefreshToken({ userId, tokenType: 'refresh' });
  return { accessToken, refreshToken };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Create a new user account and return token pair.
 */
router.post(
  '/register',
  validate(RegisterSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body as z.infer<typeof RegisterSchema>;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        next(createError('An account with this email already exists', 409, 'EMAIL_TAKEN'));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
        select: { id: true, email: true, createdAt: true },
      });

      const tokens = generateTokenPair(user.id, user.email);

      logger.info({ userId: user.id }, 'User registered');

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Authenticate and return token pair.
 */
router.post(
  '/login',
  validate(LoginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      // Constant-time comparison even when user doesn't exist
      const passwordToCompare = user?.password ?? '$2b$12$invalidhashplaceholderXXXX';
      const passwordValid = await bcrypt.compare(password, passwordToCompare);

      if (!user || !passwordValid) {
        next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
        return;
      }

      const tokens = generateTokenPair(user.id, user.email);

      logger.info({ userId: user.id }, 'User logged in');

      res.json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/auth/refresh
 * Exchange a valid refresh token for a new token pair.
 */
router.post(
  '/refresh',
  validate(RefreshSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;

    try {
      let payload: RefreshTokenPayload;
      try {
        payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as RefreshTokenPayload;
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          next(createError('Refresh token has expired', 401, 'TOKEN_EXPIRED'));
        } else {
          next(createError('Invalid refresh token', 401, 'INVALID_TOKEN'));
        }
        return;
      }

      if (payload.tokenType !== 'refresh') {
        next(createError('Invalid token type', 401, 'INVALID_TOKEN'));
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
      });

      if (!user) {
        next(createError('User not found', 401, 'INVALID_TOKEN'));
        return;
      }

      const tokens = generateTokenPair(user.id, user.email);

      res.json(tokens);
    } catch (err) {
      next(err);
    }
  }
);

export { router as authRouter };
