import { z } from 'zod';
import { ChartCalculationSchema } from '../models/chart';
import { ProfileSchema } from '../models/user';
import { SynthesisSchema } from '../models/synthesis';

// Generic API response wrapper

export type ApiResponse<T> = {
  data: T;
};

// API error type

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
};

// Paginated response type

export type PaginatedResponse<T> = {
  data: T[];
  cursor?: string;
  hasMore: boolean;
};

// Domain-specific response types

export const ChartResponseSchema = ChartCalculationSchema;
export type ChartResponse = z.infer<typeof ChartResponseSchema>;

export const ProfileResponseSchema = ProfileSchema;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const SynthesisResponseSchema = SynthesisSchema;
export type SynthesisResponse = z.infer<typeof SynthesisResponseSchema>;
