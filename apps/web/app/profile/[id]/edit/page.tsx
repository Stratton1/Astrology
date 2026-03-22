'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthGuard } from '@/components/AuthGuard';
import { useProfile, useUpdateProfile } from '@/lib/hooks';

const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional()
    .or(z.literal('')),
  timeUnknown: z.boolean().default(false),
  locationName: z.string().min(1, 'Location is required').max(200),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezoneId: z.string().min(1, 'Timezone is required'),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

function EditProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile(id);
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
  });

  const timeUnknown = watch('timeUnknown');

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        date: profile.birthData.date,
        time: profile.birthData.time || '',
        timeUnknown: profile.birthData.timeUnknown,
        locationName: profile.birthData.locationName,
        latitude: profile.birthData.latitude,
        longitude: profile.birthData.longitude,
        timezoneId: profile.birthData.timezoneId,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: EditProfileValues) => {
    setError(null);
    try {
      await updateProfile.mutateAsync({
        id,
        payload: {
          name: data.name,
          birthData: {
            date: data.date,
            time: data.timeUnknown ? undefined : data.time || undefined,
            timeUnknown: data.timeUnknown,
            latitude: data.latitude,
            longitude: data.longitude,
            locationName: data.locationName,
            timezoneId: data.timezoneId,
            utcOffset: 0,
          },
        },
      });
      router.push(`/profile/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center">
        <p className="text-cosmos-silver/60">Loading...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-[80vh] px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto cosmos-card text-center py-16">
          <p className="text-red-400 mb-4">Profile not found.</p>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/profile/${id}`}
          className="text-cosmos-silver/60 hover:text-cosmos-sky text-sm inline-flex items-center gap-1 transition-colors mb-4"
        >
          ← Back to Profile
        </Link>

        <h1 className="font-display text-3xl font-bold text-gradient-cosmos mb-8">
          Edit Profile
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Name */}
          <section className="cosmos-card space-y-5">
            <h2 className="font-display text-xl font-semibold text-cosmos-sky">
              Profile
            </h2>
            <div>
              <label htmlFor="name" className="cosmos-label">
                Name <span className="text-cosmos-gold">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="cosmos-input"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>
          </section>

          {/* Birth Data */}
          <section className="cosmos-card space-y-5">
            <h2 className="font-display text-xl font-semibold text-cosmos-gold">
              Birth Data
            </h2>

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

            <div>
              <label htmlFor="time" className="cosmos-label">
                Birth Time
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="time"
                  type="time"
                  {...register('time')}
                  disabled={timeUnknown}
                  className="cosmos-input disabled:opacity-40"
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
            </div>

            <div>
              <label htmlFor="locationName" className="cosmos-label">
                Location <span className="text-cosmos-gold">*</span>
              </label>
              <input
                id="locationName"
                type="text"
                {...register('locationName')}
                className="cosmos-input"
                aria-invalid={!!errors.locationName}
              />
              {errors.locationName && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.locationName.message}
                </p>
              )}
            </div>

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
                  className="cosmos-input"
                  aria-invalid={!!errors.latitude}
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.latitude.message}
                  </p>
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
                  className="cosmos-input"
                  aria-invalid={!!errors.longitude}
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.longitude.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="timezoneId" className="cosmos-label">
                Timezone <span className="text-cosmos-gold">*</span>
              </label>
              <input
                id="timezoneId"
                type="text"
                {...register('timezoneId')}
                className="cosmos-input"
                aria-invalid={!!errors.timezoneId}
              />
              {errors.timezoneId && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.timezoneId.message}
                </p>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/profile/${id}`} className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="btn-primary min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AuthGuard>
      <EditProfileContent id={params.id} />
    </AuthGuard>
  );
}
