-- Enable full row data for realtime updates on projects
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- Ensure projects table is included in realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;