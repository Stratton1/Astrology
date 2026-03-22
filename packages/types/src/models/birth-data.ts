import { z } from 'zod';

export const BirthDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS format').optional(),
  timeUnknown: z.boolean().default(false),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationName: z.string().min(1).max(200),
  timezoneId: z.string().min(1), // IANA timezone ID e.g. "America/New_York"
  utcOffset: z.number().min(-12).max(14),
});

export type BirthData = z.infer<typeof BirthDataSchema>;
