# Active Context

## Current Focus
Recently synced all changes made via Lovable. Focus is on the new admin structure, image processing pipeline, and ensuring smooth runtime with Supabase.

## Recent Changes (Latest Session)
1. **Admin App Restructure**:
   - New `AdminLayout` and routes: `admin/login`, `admin/dashboard`, `admin/projects`, `admin/categories`.
   - Replaced legacy `admin/portfolio` flow; introduced `ProjectForm` and `ImageUpload` components.
2. **Image Pipeline**:
   - New Edge Function `process-image` for server-side image handling.
   - New util `utils/imageProcessing.ts` and UI `components/ui/StaticImage.tsx` (replaces `optimized-image`).
3. **Data Layer Updates**:
   - Major refactor of `data/portfolioStore.ts`.
   - `integrations/supabase/types.ts` updated; new migrations added for categories and policies.
4. **Testimonials/Admin**:
   - Updated admin testimonials editor and list; new admin pages structure.
5. **Housekeeping**:
   - Removed old integration test and legacy modules; minor homepage/section tweaks.

## Current State
- Runtime builds successfully after dependency sync.
- Admin now uses route-based layout and login; portfolio management via `projects` page.
- Image rendering uses `StaticImage`; processing handled by Edge Function in Supabase.
- Solutions/visual solutions still sourced from `site_configs` with localStorage mirror.
- Some unit tests need updates post-refactor; no known runtime regressions.

## Next Steps
- Deploy `process-image` Edge Function; apply new migrations to production.
- Verify admin auth gating (`admin/login`) and RLS policies end-to-end.
- Update/realign tests to match new admin and imaging flows.
