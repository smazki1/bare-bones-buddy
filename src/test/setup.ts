import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Polyfill IntersectionObserver for jsdom (used by framer-motion and our hooks)
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  constructor() {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

// Mock IntersectionObserver for jsdom environment
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Supabase global mock to avoid network/WS handles
vi.mock('@supabase/supabase-js', () => {
  const mockQuery = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    single: vi.fn(async () => ({ data: null, error: null })),
    upsert: vi.fn(async () => ({ error: null })),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  });

  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => mockQuery()),
      functions: { invoke: vi.fn(async () => ({ data: { ok: true }, error: null })) },
      auth: { getSession: vi.fn(async () => ({ data: { session: { user: { id: 'test' } } } })) },
      rpc: vi.fn(async () => ({ data: { id: 'admin' }, error: null })),
      channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn(), unsubscribe: vi.fn() })),
      removeChannel: vi.fn(),
    })),
  };
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
