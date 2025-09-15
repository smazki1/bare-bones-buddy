import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { RequireAdmin } from '@/components/admin/RequireAdmin';

vi.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: vi.fn(),
}));

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

describe('RequireAdmin', () => {
  beforeEach(() => {
    (useSupabaseAuth as any).mockReset();
  });

  it('renders loading state while auth is loading', () => {
    (useSupabaseAuth as any).mockReturnValue({ user: null, isAdmin: false, isLoading: true });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<RequireAdmin />}> 
            <Route path="/admin/dashboard" element={<div>Protected</div>} />
          </Route>
          <Route path="/admin/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('טוען...')).toBeInTheDocument();
  });

  it('allows access when user is admin', async () => {
    (useSupabaseAuth as any).mockReturnValue({ user: { id: 'u1' }, isAdmin: true, isLoading: false });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<RequireAdmin />}> 
            <Route path="/admin/dashboard" element={<div>Protected</div>} />
          </Route>
          <Route path="/admin/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('redirects to login when not admin', async () => {
    (useSupabaseAuth as any).mockReturnValue({ user: null, isAdmin: false, isLoading: false });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<RequireAdmin />}> 
            <Route path="/admin/dashboard" element={<div>Protected</div>} />
          </Route>
          <Route path="/admin/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});


