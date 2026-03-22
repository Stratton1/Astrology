import { z } from 'zod';
import { TraditionSchema } from './chart';

export const SynthesisStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
]);
export type SynthesisStatus = z.infer<typeof SynthesisStatusSchema>;

export const SynthesisSchema = z.object({
  id: z.string(),
  chartId: z.string(),
  tradition: TraditionSchema,
  status: SynthesisStatusSchema,
  content: z.string().optional(),
  model: z.string().optional(),
  tokensUsed: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});
export type Synthesis = z.infer<typeof SynthesisSchema>;
