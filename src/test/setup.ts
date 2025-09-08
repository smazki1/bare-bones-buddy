import '@testing-library/jest-dom/vitest';
<<<<<<< HEAD
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

// @ts-expect-error jsdom environment
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


=======
import { vi, beforeEach, afterEach } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: options?.rootMargin || '0px',
  thresholds: options?.thresholds || [0]
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.alert, confirm, etc.
global.alert = vi.fn();
global.confirm = vi.fn(() => true);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsText: vi.fn(),
  result: '',
  onload: null,
  onerror: null
})) as any;

// Mock Blob
global.Blob = vi.fn().mockImplementation((content, options) => ({
  size: content ? content.join('').length : 0,
  type: options?.type || '',
  content
})) as any;

// Create comprehensive Supabase mock
const mockSupabaseResponse = (data: any = null, error: any = null) => 
  Promise.resolve({ data, error });

const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => mockSupabaseResponse({ content: null })),
        single: vi.fn(() => mockSupabaseResponse(null)),
        order: vi.fn(() => ({
          order: vi.fn(() => mockSupabaseResponse([])),
          maybeSingle: vi.fn(() => mockSupabaseResponse(null)),
          single: vi.fn(() => mockSupabaseResponse(null))
        }))
      })),
      order: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => mockSupabaseResponse([]))
        }))
      })),
      maybeSingle: vi.fn(() => mockSupabaseResponse(null)),
      single: vi.fn(() => mockSupabaseResponse(null))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => mockSupabaseResponse({ 
          id: Date.now(), 
          created_at: new Date().toISOString() 
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => mockSupabaseResponse({ 
            id: 1, 
            updated_at: new Date().toISOString() 
          }))
        }))
      }))
    })),
    upsert: vi.fn(() => mockSupabaseResponse(true)),
    delete: vi.fn(() => ({
      eq: vi.fn(() => mockSupabaseResponse(true))
    }))
  })),
  functions: {
    invoke: vi.fn(() => mockSupabaseResponse({ 
      ok: true, 
      data: { id: 1, created_at: new Date().toISOString() } 
    }))
  },
  auth: {
    getSession: vi.fn(() => mockSupabaseResponse({ 
      session: { 
        user: { id: 'test-user-id', email: 'test@example.com' } 
      } 
    }))
  },
  rpc: vi.fn(() => mockSupabaseResponse({ 
    email: 'admin@test.com', 
    user_id: 'test-user-id' 
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn()
    }))
  })),
  removeChannel: vi.fn()
});

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createMockSupabaseClient())
}));

// Mock the Supabase client from our integration
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

// Mock framer-motion for test performance
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    button: 'button',
    img: 'img'
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn()
  })
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '' }),
    useParams: () => ({}),
    Link: ({ children, to, ...props }: any) => (
      React.createElement('a', { href: to, ...props }, children)
    )
  };
});

// Global React import for JSX
import React from 'react';
global.React = React;

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
>>>>>>> origin/main
