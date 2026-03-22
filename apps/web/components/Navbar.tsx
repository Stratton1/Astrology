'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCosmosStore } from '@/lib/store';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useCosmosStore();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="border-b border-cosmos-midnight/50 px-4 sm:px-6 py-3 sticky top-0 z-50 bg-cosmos-void/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-display text-xl font-bold text-gradient-cosmos"
          >
            COSMOS
          </Link>

          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`btn-ghost text-sm ${
                  isActive('/dashboard')
                    ? 'text-cosmos-sky bg-cosmos-midnight/30'
                    : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/chart"
                className={`btn-ghost text-sm ${
                  isActive('/chart')
                    ? 'text-cosmos-sky bg-cosmos-midnight/30'
                    : ''
                }`}
              >
                New Chart
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <DarkModeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-cosmos-silver/60 text-sm truncate max-w-[180px]">
                {user?.email}
              </span>
              <button
                onClick={() => clearAuth()}
                className="btn-ghost text-sm text-cosmos-silver/60 hover:text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav for authenticated users */}
      {isAuthenticated && (
        <div className="sm:hidden flex items-center gap-1 mt-2 -mx-1">
          <Link
            href="/dashboard"
            className={`btn-ghost text-xs flex-1 text-center ${
              isActive('/dashboard')
                ? 'text-cosmos-sky bg-cosmos-midnight/30'
                : ''
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/chart"
            className={`btn-ghost text-xs flex-1 text-center ${
              isActive('/chart')
                ? 'text-cosmos-sky bg-cosmos-midnight/30'
                : ''
            }`}
          >
            New Chart
          </Link>
        </div>
      )}
    </nav>
  );
}
