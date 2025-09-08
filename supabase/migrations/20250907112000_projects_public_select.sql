-- Ensure projects table has RLS enabled (no-op if already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_namespace n ON n.oid = t.schemaname::regnamespace
    WHERE n.nspname = 'public' AND t.tablename = 'projects'
  ) THEN
    RAISE NOTICE 'projects table not found - ensure base migration created it';
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) read access to projects for portfolio page
CREATE POLICY IF NOT EXISTS "Public can read projects"
ON public.projects
FOR SELECT
USING (true);

