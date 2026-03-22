import { Queue, Worker, Job } from 'bullmq';
import { config } from './config';
import { logger } from './logger';

// ─── Connection config ──────────────────────────────────────────────────────

const connection = {
  host: new URL(config.redisUrl).hostname || 'localhost',
  port: parseInt(new URL(config.redisUrl).port || '6379', 10),
  maxRetriesPerRequest: null, // Required by BullMQ
};

// ─── Queue names ────────────────────────────────────────────────────────────

export const SYNTHESIS_QUEUE = 'synthesis';

// ─── Job data types ─────────────────────────────────────────────────────────

export interface SynthesisJobData {
  synthesisId: string;
  chartId: string;
  tradition: string;
  calculatedData: string; // JSON-stringified chart data
}

// ─── Queue instance ─────────────────────────────────────────────────────────

let synthesisQueue: Queue<SynthesisJobData> | null = null;

export function getSynthesisQueue(): Queue<SynthesisJobData> | null {
  if (synthesisQueue) return synthesisQueue;

  try {
    synthesisQueue = new Queue<SynthesisJobData>(SYNTHESIS_QUEUE, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });

    synthesisQueue.on('error', (err: Error) => {
      logger.error({ err }, 'Synthesis queue error');
    });

    logger.info('Synthesis queue initialized');
    return synthesisQueue;
  } catch (err) {
    logger.warn({ err }, 'Failed to initialize synthesis queue — synthesis disabled');
    return null;
  }
}

// ─── Enqueue helper ─────────────────────────────────────────────────────────

export async function enqueueSynthesisJob(
  data: SynthesisJobData
): Promise<string | null> {
  const queue = getSynthesisQueue();
  if (!queue) {
    logger.warn('Synthesis queue unavailable — cannot enqueue job');
    return null;
  }

  const job = await queue.add('generate', data, {
    jobId: data.synthesisId,
  });

  logger.info(
    { jobId: job.id, synthesisId: data.synthesisId },
    'Synthesis job enqueued'
  );

  return job.id ?? null;
}

// ─── Export connection for worker reuse ──────────────────────────────────────

export { connection as redisConnection };
export { Worker, Job };
export type { Queue };
