'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { useProfiles, useCharts, useDeleteProfile } from '@/lib/hooks';
import { useCosmosStore } from '@/lib/store';
import { useState } from 'react';

function DashboardContent() {
  const user = useCosmosStore((s) => s.user);
  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useProfiles();
  const { data: charts, isLoading: chartsLoading } = useCharts();
  const deleteProfile = useDeleteProfile();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete profile "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProfile.mutateAsync(id);
    } catch {
      // Error shown via query state
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-[80vh] px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-cosmos">
            Dashboard
          </h1>
          <p className="text-cosmos-silver/60 mt-1">
            Welcome back{user?.email ? `, ${user.email}` : ''}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profiles Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-cosmos-sky">
                Profiles
              </h2>
              <Link href="/chart" className="btn-primary text-sm py-2">
                + New Chart
              </Link>
            </div>

            {profilesLoading ? (
              <div className="cosmos-card text-center py-12">
                <p className="text-cosmos-silver/60">Loading profiles...</p>
              </div>
            ) : profilesError ? (
              <div className="cosmos-card text-center py-12">
                <p className="text-red-400 text-sm">Failed to load profiles.</p>
              </div>
            ) : !profiles || profiles.length === 0 ? (
              <div className="cosmos-card text-center py-12">
                <p className="text-cosmos-silver/50 mb-4">No profiles yet.</p>
                <Link href="/chart" className="btn-secondary text-sm">
                  Create Your First Chart
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="cosmos-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-cosmos-mist truncate">
                        {profile.name}
                      </h3>
                      <p className="text-cosmos-silver/50 text-sm">
                        {profile.birthData.locationName} &middot;{' '}
                        {profile.birthData.date}
                        {profile.birthData.time && ` at ${profile.birthData.time}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/profile/${profile.id}`}
                        className="btn-ghost text-sm text-cosmos-azure"
                      >
                        View
                      </Link>
                      <Link
                        href={`/profile/${profile.id}/edit`}
                        className="btn-ghost text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(profile.id, profile.name)}
                        disabled={deletingId === profile.id}
                        className="btn-ghost text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === profile.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-cosmos-gold">
              Overview
            </h2>
            <div className="cosmos-card">
              <dl className="space-y-4">
                <div>
                  <dt className="text-cosmos-silver/50 text-sm">Profiles</dt>
                  <dd className="text-2xl font-bold text-cosmos-mist">
                    {profilesLoading ? '...' : profiles?.length ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50 text-sm">Charts</dt>
                  <dd className="text-2xl font-bold text-cosmos-mist">
                    {chartsLoading ? '...' : charts?.length ?? 0}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="cosmos-card">
              <h3 className="text-sm font-semibold text-cosmos-silver mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chart"
                  className="block btn-ghost text-sm text-left w-full"
                >
                  Calculate new chart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
