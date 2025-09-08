import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({ user: { id: '1' }, isLoading: false, isAdmin: true })
}));

vi.mock('@/data/solutionsStore', async () => {
  const actual = await vi.importActual<any>('@/data/solutionsStore');
  return {
    solutionsStore: {
      ...actual.solutionsStore,
      safeGetConfigOrDefaults: vi.fn(() => ({
        sectionTitle: 'T',
        sectionSubtitle: 'S',
        items: [
          { id: 'a', title: 'A', imageSrc: '', videoSrc: '', tagSlug: 'a', href: '', enabled: true, order: 0 },
        ],
      })),
      getConfig: vi.fn(() => null),
      fetchFromSupabase: vi.fn(async () => ({
        sectionTitle: 'T',
        sectionSubtitle: 'S',
        items: [
          { id: 'a', title: 'A', imageSrc: '', videoSrc: '', tagSlug: 'a', href: '', enabled: true, order: 0 },
          { id: 'b', title: 'B', imageSrc: '', videoSrc: '', tagSlug: 'b', href: '', enabled: false, order: 1 },
        ],
      })),
      saveConfig: vi.fn(() => true),
      saveToSupabase: vi.fn(async () => true),
      generateId: vi.fn((t: string) => t.toLowerCase()),
    }
  };
});

// Stub the Radix-based editor to avoid portal complexities in tests
vi.mock('@/components/admin/solutions/AdminSolutionsEditor', () => {
  const React = require('react');
  const mockFn = vi.fn(({ isOpen }: { isOpen: boolean }) => (
    isOpen ? React.createElement('div', { role: 'dialog' }, 'כרטיס חדש') : null
  ));
  return { __esModule: true, default: mockFn };
});

import AdminSolutions from '@/pages/admin/solutions';
import Editor from '@/components/admin/solutions/AdminSolutionsEditor';

describe('AdminSolutions - cloud-first', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('loads from Supabase first and shows items', async () => {
    render(
      <MemoryRouter>
        <AdminSolutions />
      </MemoryRouter>
    );
    // Wait for cloud items
    await screen.findByText('A');
    await screen.findByText('B');
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });

  it('opens editor modal on add card', async () => {
    render(
      <MemoryRouter>
        <AdminSolutions />
      </MemoryRouter>
    );
    await screen.findAllByText('הכרטיסים');
    const addButtons = screen.getAllByText('הוסף כרטיס');
    const user = userEvent.setup();
    await user.click(addButtons[0]);
    // Verify stubbed editor received isOpen=true
    await new Promise(r => setTimeout(r, 0));
    const calls = (Editor as unknown as { mock: { calls: any[][] } }).mock.calls;
    const opened = calls.some(call => call?.[0]?.isOpen === true);
    expect(opened).toBe(true);
  });
});


