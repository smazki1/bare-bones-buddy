import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AdminLogin from '@/pages/admin/login';

vi.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: vi.fn(),
}));

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const renderAt = (initialPath: string, state?: any) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: initialPath, state }] }>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<div>Dashboard</div>} />
        <Route path="/admin/projects" element={<div>Projects</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminLogin redirect', () => {
  beforeEach(() => {
    (useSupabaseAuth as any).mockReset();
  });

  it('shows form when unauthenticated', () => {
    (useSupabaseAuth as any).mockReturnValue({ user: null, isAdmin: false, isLoading: false, signIn: vi.fn(), signUp: vi.fn() });
    renderAt('/admin/login');
    expect(screen.getByText('התחברות')).toBeInTheDocument();
  });

  it('redirects to dashboard when already authenticated', () => {
    (useSupabaseAuth as any).mockReturnValue({ user: { id: 'u1' }, isAdmin: true, isLoading: false, signIn: vi.fn(), signUp: vi.fn() });
    renderAt('/admin/login');
    // Router will navigate immediately; expect destination to be rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects back to state.from after login resolution', () => {
    (useSupabaseAuth as any).mockReturnValue({ user: { id: 'u1' }, isAdmin: true, isLoading: false, signIn: vi.fn(), signUp: vi.fn() });
    renderAt('/admin/login', { from: '/admin/projects' });
    expect(screen.queryByText('Projects')).toBeTruthy();
  });
});
