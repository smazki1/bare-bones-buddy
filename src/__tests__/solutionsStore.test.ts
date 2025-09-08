import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Supabase client before importing the store
vi.mock('@/integrations/supabase/client', () => {
  const from = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    upsert: vi.fn(async () => ({ error: null })),
  }));
  return { supabase: { from } } as any;
});

import { solutionsStore } from '@/data/solutionsStore';
import type { SolutionsConfig } from '@/types/solutions';

const SAMPLE_CONFIG = (overrides?: Partial<SolutionsConfig>): SolutionsConfig => ({
  sectionTitle: 'כותרת',
  sectionSubtitle: 'תת',
  items: [
    { id: 'dup', title: 'A', imageSrc: '', videoSrc: '', tagSlug: 'a', href: '', enabled: true, order: 1 },
    { id: 'dup', title: 'B', imageSrc: '', videoSrc: '', tagSlug: 'b', href: '', enabled: false, order: 0 },
  ],
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('solutionsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saveConfig stores normalized config and dispatches update event', () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    const ok = solutionsStore.saveConfig(SAMPLE_CONFIG());
    expect(ok).toBe(true);
    const raw = localStorage.getItem('aiMaster:solutions');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    // order fixed to 0..n-1
    expect(parsed.items.map((i: any) => i.order)).toEqual([0, 1]);
    // duplicate ids resolved
    expect(new Set(parsed.items.map((i: any) => i.id)).size).toBe(2);
    expect(spy).toHaveBeenCalled();
  });

  it('getConfig returns null when nothing stored or invalid', () => {
    expect(solutionsStore.getConfig()).toBeNull();
    localStorage.setItem('aiMaster:solutions', '{not-json');
    expect(solutionsStore.getConfig()).toBeNull();
  });

  it('getConfig returns normalized config from storage', () => {
    solutionsStore.saveConfig(SAMPLE_CONFIG());
    const cfg = solutionsStore.getConfig();
    expect(cfg).not.toBeNull();
    expect(cfg!.items[0].order).toBe(0);
  });

  it('fetchFromSupabase returns normalized config and syncs to localStorage', async () => {
    const mockContent = SAMPLE_CONFIG({ items: [
      { id: 'x', title: 'X', imageSrc: '', videoSrc: '', tagSlug: 'x', href: '', enabled: true, order: 3 },
      { id: 'y', title: 'Y', imageSrc: '', videoSrc: '', tagSlug: 'y', href: '', enabled: true, order: 1 },
    ]});

    const { supabase } = await import('@/integrations/supabase/client');
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: { content: mockContent }, error: null })),
    });

    const cfg = await solutionsStore.fetchFromSupabase();
    expect(cfg).not.toBeNull();
    expect(cfg!.items.map(i => i.order)).toEqual([0, 1]);
    expect(localStorage.getItem('aiMaster:solutions')).toBeTruthy();
  });

  it('saveToSupabase upserts and dispatches event', async () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    const ok = await solutionsStore.saveToSupabase(SAMPLE_CONFIG());
    expect(ok).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});


