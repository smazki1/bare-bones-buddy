-- Create new projects table for Food Vision portfolio system
-- This replaces the existing projects table with optimized structure

DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_before_url text NOT NULL,
  image_after_url text NOT NULL,
  image_after_thumb_url text NOT NULL,
  category_ids text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_index integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admin users can manage projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at_trigger
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

-- Create index for performance
CREATE INDEX idx_projects_featured ON projects (is_featured);
CREATE INDEX idx_projects_order ON projects (order_index);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);