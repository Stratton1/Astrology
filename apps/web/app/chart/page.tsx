'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import type { Tradition, HouseSystem } from '@cosmos/types';

const chartFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional()
    .or(z.literal('')),
  timeUnknown: z.boolean().default(false),
  locationName: z.string().min(1, 'Location is required').max(200),
  latitude: z.coerce
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90)
    .max(90),
  longitude: z.coerce
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180)
    .max(180),
  timezoneId: z.string().min(1, 'Timezone is required'),
  tradition: z.enum(['western', 'vedic', 'hellenistic'] as const),
  houseSystem: z.enum([
    'placidus',
    'whole_sign',
    'equal',
    'koch',
    'campanus',
    'regiomontanus',
  ] as const),
});

type ChartFormValues = z.infer<typeof chartFormSchema>;

const TRADITIONS: { value: Tradition; label: string; description: string }[] = [
  { value: 'western', label: 'Western', description: 'Tropical zodiac, psychological focus' },
  { value: 'vedic', label: 'Vedic (Jyotish)', description: 'Sidereal zodiac, Jyotish tradition' },
  { value: 'hellenistic', label: 'Hellenistic', description: 'Ancient Greek techniques' },
];

const HOUSE_SYSTEMS: { value: HouseSystem; label: string; traditions: Tradition[] }[] = [
  { value: 'placidus', label: 'Placidus', traditions: ['western', 'hellenistic'] },
  { value: 'whole_sign', label: 'Whole Sign', traditions: ['western', 'vedic', 'hellenistic'] },
  { value: 'equal', label: 'Equal', traditions: ['western', 'hellenistic'] },
  { value: 'koch', label: 'Koch', traditions: ['western'] },
  { value: 'campanus', label: 'Campanus', traditions: ['western', 'hellenistic'] },
  { value: 'regiomontanus', label: 'Regiomontanus', traditions: ['western', 'hellenistic'] },
];

export default function ChartPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChartFormValues>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: {
      tradition: 'western',
      houseSystem: 'placidus',
      timeUnknown: false,
      timezoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const selectedTradition = watch('tradition');
  const timeUnknown = watch('timeUnknown');

  const availableHouseSystems = HOUSE_SYSTEMS.filter((hs) =>
    hs.traditions.includes(selectedTradition),
  );

  const onSubmit = async (data: ChartFormValues) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const body = {
        birthData: {
          date: data.date,
          time: data.timeUnknown ? undefined : data.time || undefined,
          timeUnknown: data.timeUnknown,
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: data.locationName,
          timezoneId: data.timezoneId,
          utcOffset: 0, // TODO: derive from timezoneId
        },
        tradition: data.tradition,
        houseSystem: data.houseSystem,
        coordinateSystem: data.tradition === 'vedic' ? 'sidereal' : 'tropical',
      };

      const res = await fetch(`${apiUrl}/api/v1/charts/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const json = (await res.json()) as { data: { id?: string } };
      const chartId = json.data?.id ?? 'new';
      router.push(`/chart/${chartId}`);
    } catch (err) {
      console.error('Failed to calculate chart:', err);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-cosmos-silver/60 hover:text-cosmos-sky text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            ← Back
          </Link>
          <h1 className="font-display text-4xl font-bold text-gradient-cosmos mt-2">Create Chart</h1>
          <p className="text-cosmos-silver/70 mt-2">
            Enter birth data to calculate a natal chart.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Birth Data Section */}
          <section className="cosmos-card space-y-5">
            <h2 className="font-display text-xl font-semibold text-cosmos-sky">Birth Data</h2>

            {/* Date */}
            <div>
              <label htmlFor="date" className="cosmos-label">
                Birth Date <span className="text-cosmos-gold">*</span>
              </label>
              <input
                id="date"
                type="date"
                {...register('date')}
                className="cosmos-input"
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="cosmos-label">
                Birth Time{' '}
                <span className="text-cosmos-silver/50 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="time"
                  type="time"
                  {...register('time')}
                  disabled={timeUnknown}
                  className="cosmos-input disabled:opacity-40"
                  aria-invalid={!!errors.time}
                />
                <label className="flex items-center gap-2 text-sm text-cosmos-silver cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    {...register('timeUnknown')}
                    onChange={(e) => {
                      setValue('timeUnknown', e.target.checked);
                      if (e.target.checked) setValue('time', '');
                    }}
                    className="accent-cosmos-azure"
                  />
                  Unknown
                </label>
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-400">{errors.time.message}</p>
              )}
            </div>

            {/* Location Name */}
            <div>
              <label htmlFor="locationName" className="cosmos-label">
                Birth Location <span className="text-cosmos-gold">*</span>
              </label>
              <input
                id="locationName"
                type="text"
                {...register('locationName')}
                placeholder="e.g. New York, NY, USA"
                className="cosmos-input"
                aria-invalid={!!errors.locationName}
              />
              {errors.locationName && (
                <p className="mt-1 text-sm text-red-400">{errors.locationName.message}</p>
              )}
              <p className="mt-1 text-xs text-cosmos-silver/50">
                Enter coordinates manually below (geocoding integration coming soon).
              </p>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="cosmos-label">
                  Latitude <span className="text-cosmos-gold">*</span>
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  {...register('latitude')}
                  placeholder="e.g. 40.7128"
                  className="cosmos-input"
                  aria-invalid={!!errors.latitude}
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-400">{errors.latitude.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="longitude" className="cosmos-label">
                  Longitude <span className="text-cosmos-gold">*</span>
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  {...register('longitude')}
                  placeholder="e.g. -74.0060"
                  className="cosmos-input"
                  aria-invalid={!!errors.longitude}
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-400">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezoneId" className="cosmos-label">
                Timezone <span className="text-cosmos-gold">*</span>
              </label>
              <input
                id="timezoneId"
                type="text"
                {...register('timezoneId')}
                placeholder="e.g. America/New_York"
                className="cosmos-input"
                aria-invalid={!!errors.timezoneId}
              />
              {errors.timezoneId && (
                <p className="mt-1 text-sm text-red-400">{errors.timezoneId.message}</p>
              )}
              <p className="mt-1 text-xs text-cosmos-silver/50">
                IANA timezone identifier (auto-detected from your browser).
              </p>
            </div>
          </section>

          {/* Tradition Section */}
          <section className="cosmos-card space-y-5">
            <h2 className="font-display text-xl font-semibold text-cosmos-gold">Tradition</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Astrological tradition">
              {TRADITIONS.map(({ value, label, description }) => (
                <label
                  key={value}
                  className={`
                    relative flex flex-col gap-1 p-4 rounded-lg border cursor-pointer transition-all duration-200
                    ${selectedTradition === value
                      ? 'border-cosmos-azure bg-cosmos-azure/10 shadow-glow'
                      : 'border-cosmos-midnight hover:border-cosmos-indigo'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('tradition')}
                    onChange={() => {
                      setValue('tradition', value);
                      // Reset house system to first available
                      const available = HOUSE_SYSTEMS.filter((hs) =>
                        hs.traditions.includes(value),
                      );
                      if (available[0]) setValue('houseSystem', available[0].value);
                    }}
                    className="sr-only"
                  />
                  <span className="font-semibold text-cosmos-mist text-sm">{label}</span>
                  <span className="text-xs text-cosmos-silver/60">{description}</span>
                </label>
              ))}
            </div>
          </section>

          {/* House System Section */}
          <section className="cosmos-card space-y-4">
            <h2 className="font-display text-xl font-semibold text-cosmos-lavender">House System</h2>

            <div>
              <label htmlFor="houseSystem" className="cosmos-label">
                Select House System
              </label>
              <select
                id="houseSystem"
                {...register('houseSystem')}
                className="cosmos-input"
              >
                {availableHouseSystems.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[160px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Calculating…
                </span>
              ) : (
                'Calculate Chart'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
