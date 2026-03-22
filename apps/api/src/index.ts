import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import rateLimit from 'express-rate-limit';

import { config } from './lib/config';
import { logger } from './lib/logger';

import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { profilesRouter } from './routes/profiles';
import { chartsRouter } from './routes/charts';
import { synthesisRouter } from './routes/synthesis';

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// ─── Request parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));

// ─── Request ID ─────────────────────────────────────────────────────────────
app.use(requestId);

// ─── HTTP request logging ───────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    // Assign req.id to the pino-http genReqId so it matches our request ID
    genReqId: (req) => (req as express.Request).id,
    customLogLevel(_req, res, err) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          remoteAddress: req.remoteAddress,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// ─── Rate limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
});

app.use(globalLimiter);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/profiles', profilesRouter);
app.use('/api/v1/charts', chartsRouter);
app.use('/api/v1/synthesis', synthesisRouter);

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
    },
  });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ───────────────────────────────────────────────────────────
const port = config.port;

app.listen(port, () => {
  logger.info(
    { port, env: config.nodeEnv },
    `COSMOS API gateway listening on port ${port}`
  );
});

export { app };
