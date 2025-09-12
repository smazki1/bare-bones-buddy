-- Database Cleanup - Remove duplicates and consolidate
DO $$ 
BEGIN
    -- Remove any duplicate tables that might have been created
    DROP TABLE IF EXISTS projects_new CASCADE;
    DROP TABLE IF EXISTS categories_new CASCADE;
    DROP TABLE IF EXISTS services_new CASCADE;
    DROP TABLE IF EXISTS testimonials_new CASCADE;
    DROP TABLE IF EXISTS faq_new CASCADE;
    DROP TABLE IF EXISTS site_content_new CASCADE;
END $$;

-- Ensure projects table has all required columns
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_after_thumb_url text,
ADD COLUMN IF NOT EXISTS category_ids text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  cta_text text DEFAULT 'דברו איתנו',
  cta_link text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure RLS policies exist for new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY IF NOT EXISTS "Admin users can manage categories" ON categories FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Public read access for categories" ON categories FOR SELECT 
USING (true);

-- Services policies  
CREATE POLICY IF NOT EXISTS "Admin users can manage services" ON services FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Public read access for services" ON services FOR SELECT 
USING (true);