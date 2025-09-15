import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

vi.mock('@/integrations/supabase/client', () => {
  const rpc = vi.fn();
  const onAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }));
  const getSession = vi.fn(async () => ({ data: { session: null } }));
  const signOut = vi.fn(async () => ({ error: null }));
  return {
    supabase: {
      auth: { onAuthStateChange, getSession, signInWithPassword: vi.fn(), signOut },
      rpc,
      from: vi.fn(),
      functions: { invoke: vi.fn() },
      channel: vi.fn(),
      removeChannel: vi.fn(),
    }
  };
});

import { supabase } from '@/integrations/supabase/client';

describe('useSupabaseAuth - extras', () => {
  const originalHostname = window.location.hostname;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enables local dev admin fallback on private IP for allowed email', async () => {
    Object.defineProperty(window, 'location', { value: { hostname: '192.168.0.10', origin: 'http://192.168.0.10:8080' }, writable: true } as any);

    (supabase.auth.getSession as any).mockResolvedValueOnce({ data: { session: { user: { id: 'u1', email: 'admin@foodvision.com' } } } });
    (supabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }); // link
    (supabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }); // get_admin_user => not admin

    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});

    expect(result.current.isAdmin).toBe(true);

    // restore hostname
    Object.defineProperty(window, 'location', { value: { hostname: originalHostname }, writable: true } as any);
  });

  it('signOut clears user and admin state', async () => {
    (supabase.auth.getSession as any).mockResolvedValueOnce({ data: { session: { user: { id: 'u1', email: 'admin@foodvision.com' } } } });
    (supabase.rpc as any).mockResolvedValueOnce({ data: null, error: null });
    (supabase.rpc as any).mockResolvedValueOnce({ data: { user_id: 'u1' }, error: null });

    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    expect(result.current.isAdmin).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
});
