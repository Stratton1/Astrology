'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCosmosStore } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useCosmosStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-cosmos-silver/60">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
