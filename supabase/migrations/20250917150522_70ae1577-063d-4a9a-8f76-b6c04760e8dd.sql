-- Add size column to projects table
ALTER TABLE public.projects 
ADD COLUMN size text DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large'));