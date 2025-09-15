import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

vi.mock('@/integrations/supabase/client', () => {
  const rpc = vi.fn();
  const onAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }));
  const getSession = vi.fn(async () => ({ data: { session: null } }));
  return {
    supabase: {
      auth: { onAuthStateChange, getSession, signInWithPassword: vi.fn(), signOut: vi.fn() },
      rpc,
      from: vi.fn(),
      functions: { invoke: vi.fn() },
      channel: vi.fn(),
      removeChannel: vi.fn(),
    }
  };
});

import { supabase } from '@/integrations/supabase/client';

describe('useSupabaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes without user and not admin', async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it('links and checks admin when session user exists', async () => {
    // mock initial session with user
    (supabase.auth.getSession as any).mockResolvedValueOnce({ data: { session: { user: { id: 'u1', email: 'admin@foodvision.com' } } } });
    (supabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }); // link_admin_user
    (supabase.rpc as any).mockResolvedValueOnce({ data: { user_id: 'u1' }, error: null }); // get_admin_user

    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {});

    expect(supabase.rpc).toHaveBeenCalledWith('link_admin_user');
    expect(supabase.rpc).toHaveBeenCalledWith('get_admin_user', { user_id_param: 'u1' });
    expect(result.current.isAdmin).toBe(true);
  });

  it('non-admin remains non-admin (no override on production)', async () => {
    (supabase.auth.getSession as any).mockResolvedValueOnce({ data: { session: { user: { id: 'u2', email: 'someone@x.com' } } } });
    (supabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }); // link
    (supabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }); // get_admin_user => not admin

    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {});

    expect(result.current.isAdmin).toBe(false);
  });
});
