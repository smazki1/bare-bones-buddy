-- Database Cleanup - Remove duplicates and consolidate (fixed syntax)
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

-- Ensure the main tables exist
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

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;