'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { useProfile, useDeleteProfile } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

function ProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: profile, isLoading, error } = useProfile(id);
  const deleteProfile = useDeleteProfile();

  const handleDelete = async () => {
    if (!profile) return;
    if (!confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) return;
    try {
      await deleteProfile.mutateAsync(id);
      router.push('/dashboard');
    } catch {
      // Error state handled by mutation
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center">
        <p className="text-cosmos-silver/60">Loading profile...</p>
      </main>
    );
  }

  if (error || !profile) {
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
          href="/dashboard"
          className="text-cosmos-silver/60 hover:text-cosmos-sky text-sm inline-flex items-center gap-1 transition-colors mb-4"
        >
          ← Dashboard
        </Link>

        <div className="flex items-start justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-gradient-cosmos">
            {profile.name}
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${id}/edit`}
              className="btn-secondary text-sm py-2"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteProfile.isPending}
              className="btn-ghost text-sm text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="cosmos-card space-y-4">
          <h2 className="font-display text-lg font-semibold text-cosmos-sky">
            Birth Data
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-cosmos-silver/50">Date</dt>
              <dd className="text-cosmos-mist font-medium">
                {profile.birthData.date}
              </dd>
            </div>
            <div>
              <dt className="text-cosmos-silver/50">Time</dt>
              <dd className="text-cosmos-mist font-medium">
                {profile.birthData.timeUnknown
                  ? 'Unknown'
                  : profile.birthData.time || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-cosmos-silver/50">Location</dt>
              <dd className="text-cosmos-mist font-medium">
                {profile.birthData.locationName}
              </dd>
            </div>
            <div>
              <dt className="text-cosmos-silver/50">Coordinates</dt>
              <dd className="text-cosmos-mist font-medium font-mono text-xs">
                {profile.birthData.latitude.toFixed(4)},{' '}
                {profile.birthData.longitude.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt className="text-cosmos-silver/50">Timezone</dt>
              <dd className="text-cosmos-mist font-medium">
                {profile.birthData.timezoneId}
              </dd>
            </div>
            <div>
              <dt className="text-cosmos-silver/50">Created</dt>
              <dd className="text-cosmos-mist font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6">
          <Link href="/chart" className="btn-primary">
            Calculate Chart for this Profile
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <ProfileContent id={params.id} />
    </AuthGuard>
  );
}
