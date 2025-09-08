# System Patterns

## Architecture Overview
The application follows a component-based React architecture with clear separation between admin and customer-facing features, backed by Supabase (Postgres, Auth, Realtime, Edge Functions).

## Key Patterns

### State Management
- **Local Storage**: Admin data persisted in localStorage via custom stores
- **Event-Driven Updates**: Custom events for real-time sync between admin and frontend
- **React State**: Component-level state for forms and UI interactions
- **Supabase Data Source**: Primary persistence for `projects`, `site_configs`, `testimonials`

### Data Flow
```
Admin Panel → Supabase (tables/RPC/Edge) → Realtime → Frontend Components
              ↘ localStorage mirror (configs) ↙
```

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── ui/             # Shadcn/ui components
│   └── [feature]/      # Feature-specific components
├── pages/              # Route components
├── data/               # Data stores and persistence
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Admin Panel Pattern
- Each admin section has: Editor, List, and main page
- Realtime: Supabase `projects` subscription (+ REPLICA IDENTITY FULL) and custom DOM events
- File upload with validation
- Drag-and-drop reordering
- AuthZ: Admin verification via `get_admin_user` RPC; privileged writes via Edge Function `portfolio-admin`

### RTL Support Pattern
- All text containers use `dir="rtl"`
- BiDi punctuation handled with `unicode-bidi: isolate-override`
- Proper Hebrew typography throughout

### Navigation Pattern
- Theme prop for background adaptation
- Responsive mobile menu
- Active link highlighting
- Logo as homepage link

### Form Pattern
- Simplified contact forms
- WhatsApp integration for submissions
- Validation and error handling
- Success state management

### Supabase Integration Pattern
- Client: `src/integrations/supabase/client.ts` (typed via `types.ts`)
- Auth flow: `useSupabaseAuth` subscribes to auth state, checks admin via `get_admin_user`, and links via `link_admin_user`
- Portfolio CRUD: `portfolio-store` attempts direct writes; on RLS failure, falls back to `portfolio-admin` Edge Function
- Site configs: `solutionsStore` and `visualSolutionsStore` read/write `site_configs` keys (`solutions_v1`, `visual_solutions_v1`), syncing to localStorage for quick loads
- Realtime handling: `portfolioStore` subscribes to `projects` table changes and updates the in-memory config accordingly
