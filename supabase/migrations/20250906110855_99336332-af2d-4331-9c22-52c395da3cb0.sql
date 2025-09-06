-- Enable realtime for projects table
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- Add the projects table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;