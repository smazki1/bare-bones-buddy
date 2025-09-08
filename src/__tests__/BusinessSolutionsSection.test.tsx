import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/data/solutionsStore', () => ({
  solutionsStore: {
    safeGetConfigOrDefaults: () => ({
      sectionTitle: 'T',
      sectionSubtitle: 'S',
      items: [
        { id: 'a', title: 'A', imageSrc: '', videoSrc: '', tagSlug: 'a', href: '', enabled: true, order: 0 },
      ],
    }),
    fetchFromSupabase: vi.fn(async () => ({
      sectionTitle: 'T',
      sectionSubtitle: 'S',
      items: [
        { id: 'a', title: 'A', imageSrc: '', videoSrc: '', tagSlug: 'a', href: '', enabled: true, order: 0 },
        { id: 'b', title: 'B', imageSrc: '', videoSrc: '', tagSlug: 'b', href: '', enabled: false, order: 1 },
      ],
    })),
  }
}));

import BusinessSolutionsSection from '@/components/solutions/BusinessSolutionsSection';

describe('BusinessSolutionsSection', () => {
  it('renders enabled items only (cloud-first)', async () => {
    render(
      <MemoryRouter>
        <BusinessSolutionsSection />
      </MemoryRouter>
    );
    const titles = await screen.findAllByText('A');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.queryByText('B')).toBeNull();
  });
});


