# Technical Context

## Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Backend**: Supabase (Postgres, Edge Functions, Realtime, RLS)

## Development Setup
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Key Dependencies
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `react-router-dom`: ^6.8.1
- `framer-motion`: ^10.16.4
- `tailwindcss`: ^3.3.0
- `@radix-ui/*`: Various UI primitives
- `lucide-react`: ^0.263.1
 - `@supabase/supabase-js`: v2

## Build Configuration
- **Vite**: Modern build tool with HMR
- **TypeScript**: Strict mode enabled
- **Tailwind**: Custom configuration for RTL support
- **PostCSS**: For CSS processing

## File Structure
- `src/components/`: Reusable components
- `src/pages/`: Route components
- `src/data/`: Data stores and persistence
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions
- `src/types/`: TypeScript definitions
 - `src/integrations/supabase/`: Typed Supabase client and generated types
 - `supabase/`: Database migrations and Edge Functions

## Backend Services (Supabase)
- Tables:
  - `projects`: Portfolio items with fields for business, media, tags, pinned, timestamps
  - `site_configs`: JSON configs keyed by `key` (e.g., `solutions_v1`, `visual_solutions_v1`)
  - `testimonials`: Client testimonials with enable flag and display order
  - `admin_users`: Links authenticated users to admin role
- Functions (RPC):
  - `get_admin_user(user_id_param)`: SECURITY DEFINER check for admin status
  - `link_admin_user()`: Best-effort linking of current user into `admin_users`
- Edge Functions:
  - `portfolio-admin`: Authenticated admin CRUD for `projects` using service role, with JWT admin check
- Realtime:
  - `projects` table enabled with REPLICA IDENTITY FULL and added to `supabase_realtime` publication
- RLS Policies (high-level):
  - `site_configs`: public read; authenticated upsert/update
  - `testimonials`: public select only for `enabled = true`; admins can manage all

## Supabase Client & Auth
- Client: `src/integrations/supabase/client.ts` (generated URL/key), with typed `Database` in `types.ts`
- Auth Hook: `src/hooks/useSupabaseAuth.tsx` manages user/session, admin status via `get_admin_user`, and session listeners
- Portfolio Admin Calls: `src/lib/supabase-projects.ts` invokes `portfolio-admin` Edge Function with JWT and admin verification
- Defensive Fallback: `src/lib/supabase.ts` offers lazy client init from env/window/localStorage for static hosts

## Deployment
- Static frontend build in `dist/` (Vite)
- Supabase project provides Postgres, Auth, Realtime, and Edge Functions
- Deploy Edge Functions (`portfolio-admin`) to Supabase; database schema managed via migrations in `supabase/migrations`

## Browser Support
- Modern browsers with ES6+ support
- RTL text rendering support
- File upload API support
