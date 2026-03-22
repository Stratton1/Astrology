import { z } from 'zod';
import { BirthDataSchema } from './birth-data';

// Enums

export const CoordinateSystemSchema = z.enum(['tropical', 'sidereal']);
export type CoordinateSystem = z.infer<typeof CoordinateSystemSchema>;

export const HouseSystemSchema = z.enum([
  'placidus',
  'whole_sign',
  'equal',
  'koch',
  'campanus',
  'regiomontanus',
]);
export type HouseSystem = z.infer<typeof HouseSystemSchema>;

export const TraditionSchema = z.enum(['western', 'vedic', 'hellenistic']);
export type Tradition = z.infer<typeof TraditionSchema>;

export const ChartTypeSchema = z.enum([
  'natal',
  'transit',
  'synastry',
  'composite',
  'solar_return',
]);
export type ChartType = z.infer<typeof ChartTypeSchema>;

export const AyanamshaSchema = z.enum([
  'lahiri',
  'raman',
  'krishnamurti',
  'fagan_bradley',
]);
export type Ayanamsha = z.infer<typeof AyanamshaSchema>;

export const PlanetSchema = z.enum([
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'NorthNode',
  'SouthNode',
  'Chiron',
]);
export type Planet = z.infer<typeof PlanetSchema>;

export const ZodiacSignSchema = z.enum([
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]);
export type ZodiacSign = z.infer<typeof ZodiacSignSchema>;

export const AspectTypeSchema = z.enum([
  'conjunction',
  'sextile',
  'square',
  'trine',
  'opposition',
  'semisextile',
  'semisquare',
  'sesquiquadrate',
  'quincunx',
  'quintile',
  'biquintile',
]);
export type AspectType = z.infer<typeof AspectTypeSchema>;

// Object schemas

export const PlanetPositionSchema = z.object({
  planet: PlanetSchema,
  longitude: z.number().min(0).max(360),
  latitude: z.number(),
  speed: z.number(),
  retrograde: z.boolean(),
  sign: ZodiacSignSchema,
  signDegree: z.number().min(0).max(30),
  house: z.number().int().min(1).max(12).optional(),
});
export type PlanetPosition = z.infer<typeof PlanetPositionSchema>;

export const HousePositionSchema = z.object({
  house: z.number().int().min(1).max(12),
  cuspLongitude: z.number().min(0).max(360),
  sign: ZodiacSignSchema,
  signDegree: z.number().min(0).max(30),
});
export type HousePosition = z.infer<typeof HousePositionSchema>;

export const AspectDataSchema = z.object({
  planet1: PlanetSchema,
  planet2: PlanetSchema,
  aspectType: AspectTypeSchema,
  exactAngle: z.number().min(0).max(360),
  orb: z.number().min(0),
  applying: z.boolean(),
});
export type AspectData = z.infer<typeof AspectDataSchema>;

export const ChartCalculationSchema = z.object({
  id: z.string().optional(),
  birthData: BirthDataSchema,
  tradition: TraditionSchema,
  chartType: ChartTypeSchema,
  coordinateSystem: CoordinateSystemSchema,
  houseSystem: HouseSystemSchema,
  ayanamsha: AyanamshaSchema.optional(),
  planets: z.array(PlanetPositionSchema),
  houses: z.array(HousePositionSchema),
  aspects: z.array(AspectDataSchema),
  ascendant: z.number().min(0).max(360),
  midheaven: z.number().min(0).max(360),
  calculatedAt: z.string().datetime(),
});
export type ChartCalculation = z.infer<typeof ChartCalculationSchema>;
