// Verify the authentication hook capabilities, checking default user profiles, loading gates, and integration actions.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';

// Stub Supabase database client authentication endpoints (sessions, signIn, signUp, onAuthStateChange listeners) prior to loading hooks.
vi.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user and loading state', async () => {
    const { result } = renderHook(() => useAuth());

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    // Wait for the hook to complete loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should provide login, signup, and logout functions', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.signup).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});