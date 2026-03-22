import { z } from 'zod';
import { BirthDataSchema } from '../models/birth-data';
import {
  TraditionSchema,
  HouseSystemSchema,
  CoordinateSystemSchema,
  AyanamshaSchema,
} from '../models/chart';

// Profile requests

export const CreateProfileRequestSchema = z.object({
  name: z.string().min(1).max(200),
  birthData: BirthDataSchema,
});
export type CreateProfileRequest = z.infer<typeof CreateProfileRequestSchema>;

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  birthData: BirthDataSchema.optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// Chart requests

export const CalculateChartRequestSchema = z.object({
  birthData: BirthDataSchema,
  tradition: TraditionSchema,
  houseSystem: HouseSystemSchema,
  coordinateSystem: CoordinateSystemSchema,
  ayanamsha: AyanamshaSchema.optional(),
});
export type CalculateChartRequest = z.infer<typeof CalculateChartRequestSchema>;

// Synthesis requests

export const GenerateSynthesisRequestSchema = z.object({
  chartId: z.string().min(1),
  tradition: TraditionSchema,
});
export type GenerateSynthesisRequest = z.infer<typeof GenerateSynthesisRequestSchema>;

// Auth requests

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
