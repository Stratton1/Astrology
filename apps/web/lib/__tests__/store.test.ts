import { describe, it, expect, beforeEach } from 'vitest';
import { useCosmosStore } from '../store';

describe('CosmosStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useCosmosStore.getState().clearAuth();
  });

  it('starts unauthenticated', () => {
    const state = useCosmosStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('sets auth state on login', () => {
    useCosmosStore.getState().setAuth({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    });

    const state = useCosmosStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@example.com');
    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-456');
  });

  it('updates access token without clearing other auth state', () => {
    useCosmosStore.getState().setAuth({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'old-token',
      refreshToken: 'refresh-456',
    });

    useCosmosStore.getState().setAccessToken('new-token');

    const state = useCosmosStore.getState();
    expect(state.accessToken).toBe('new-token');
    expect(state.user?.email).toBe('test@example.com');
    expect(state.isAuthenticated).toBe(true);
  });

  it('clears all auth state on logout', () => {
    useCosmosStore.getState().setAuth({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    });

    useCosmosStore.getState().clearAuth();

    const state = useCosmosStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });
});
