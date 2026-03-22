/**
 * Synthesis Worker
 *
 * BullMQ worker that processes synthesis jobs by calling the Claude API
 * and updating the Synthesis record in the database.
 */

import 'dotenv/config';

import { Worker, Job } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { buildSynthesisPrompt } from '../lib/prompts';
import { SYNTHESIS_QUEUE, redisConnection } from '../lib/queue';
import type { SynthesisJobData } from '../lib/queue';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

// ─── Claude client ──────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env['ANTHROPIC_API_KEY'];
const CLAUDE_MODEL = process.env['CLAUDE_MODEL'] ?? 'claude-sonnet-4-20250514';
const MAX_TOKENS = parseInt(process.env['SYNTHESIS_MAX_TOKENS'] ?? '4096', 10);

function getAnthropicClient(): Anthropic {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

// ─── Job processor ──────────────────────────────────────────────────────────

async function processSynthesisJob(job: Job<SynthesisJobData>): Promise<void> {
  const { synthesisId, tradition, calculatedData } = job.data;

  logger.info(
    { synthesisId, tradition, jobId: job.id },
    'Processing synthesis job'
  );

  // Mark as processing
  await prisma.synthesis.update({
    where: { id: synthesisId },
    data: { status: 'processing' },
  });

  try {
    // Build tradition-specific prompt
    const prompt = buildSynthesisPrompt(tradition, calculatedData);

    // Call Claude API
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    });

    // Extract text content
    const content = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n\n');

    const tokensUsed =
      (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0);

    // Update synthesis record with results
    await prisma.synthesis.update({
      where: { id: synthesisId },
      data: {
        status: 'completed',
        content,
        model: response.model,
        tokensUsed,
        completedAt: new Date(),
      },
    });

    logger.info(
      { synthesisId, model: response.model, tokensUsed },
      'Synthesis completed'
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error during synthesis';

    logger.error({ err, synthesisId }, 'Synthesis failed');

    await prisma.synthesis.update({
      where: { id: synthesisId },
      data: {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      },
    });

    throw err; // Re-throw so BullMQ retries
  }
}

// ─── Worker startup ─────────────────────────────────────────────────────────

const worker = new Worker<SynthesisJobData>(
  SYNTHESIS_QUEUE,
  processSynthesisJob,
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60_000, // 10 jobs per minute max (rate limit safety)
    },
  }
);

worker.on('completed', (job: Job<SynthesisJobData>) => {
  logger.info({ jobId: job.id, synthesisId: job.data.synthesisId }, 'Job completed');
});

worker.on('failed', (job: Job<SynthesisJobData> | undefined, err: Error) => {
  logger.error(
    { jobId: job?.id, synthesisId: job?.data.synthesisId, err },
    'Job failed'
  );
});

worker.on('error', (err: Error) => {
  logger.error({ err }, 'Worker error');
});

logger.info('Synthesis worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

export { worker };
