/**
 * COSMOS Zustand Store
 *
 * Manages global client-side state:
 *  - Auth: user object, accessToken, refreshToken, isAuthenticated
 *  - Persisted in localStorage under the key "cosmos-auth"
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@cosmos/types';

// ---------------------------------------------------------------------------
// Auth slice
// ---------------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  /** Set auth state after a successful login/register */
  setAuth: (params: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  /** Update only the access token (e.g. after a token refresh) */
  setAccessToken: (accessToken: string) => void;
  /** Clear all auth state (logout) */
  clearAuth: () => void;
}

const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

// ---------------------------------------------------------------------------
// Combined store
// ---------------------------------------------------------------------------

export type CosmosStore = AuthState & AuthActions;

export const useCosmosStore = create<CosmosStore>()(
  persist(
    (set) => ({
      // --- State ---
      ...initialAuthState,

      // --- Actions ---
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      clearAuth: () =>
        set({ ...initialAuthState }),
    }),
    {
      name: 'cosmos-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => undefined,
          removeItem: () => undefined,
        },
      ),
      // Only persist auth fields, not actions
      partialize: (state): AuthState => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Convenience selectors
// ---------------------------------------------------------------------------

/** Returns the current access token (or null if unauthenticated) */
export const selectAccessToken = (state: CosmosStore) => state.accessToken;

/** Returns true when the user is authenticated */
export const selectIsAuthenticated = (state: CosmosStore) => state.isAuthenticated;

/** Returns the current user (or null) */
export const selectUser = (state: CosmosStore) => state.user;
