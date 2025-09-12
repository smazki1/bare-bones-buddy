-- Create remaining 5 tables for Food Vision backend

-- 1. Categories table
CREATE TABLE categories (
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

-- 2. Services table
CREATE TABLE services (
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

-- 3. Site content table
CREATE TABLE site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Drop existing testimonials and recreate with new schema
DROP TABLE IF EXISTS testimonials CASCADE;

CREATE TABLE testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text NOT NULL,
  client_business text,
  content text NOT NULL,
  rating integer DEFAULT 5,
  is_featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FAQ table
CREATE TABLE faq (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add validation trigger for testimonials rating (avoiding CHECK constraint)
CREATE OR REPLACE FUNCTION validate_testimonial_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER testimonials_rating_validation
  BEFORE INSERT OR UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION validate_testimonial_rating();

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin users can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Create RLS policies for services
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin users can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Create RLS policies for site_content
CREATE POLICY "Public can read site content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin users can manage site content" ON site_content FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Create RLS policies for testimonials
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin users can manage testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Create RLS policies for faq
CREATE POLICY "Public can read active FAQ" ON faq FOR SELECT USING (is_active = true);
CREATE POLICY "Admin users can manage FAQ" ON faq FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER categories_updated_at_trigger
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER services_updated_at_trigger
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER site_content_updated_at_trigger
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER testimonials_updated_at_trigger
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER faq_updated_at_trigger
    BEFORE UPDATE ON faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create performance indexes
CREATE INDEX idx_categories_active ON categories (is_active);
CREATE INDEX idx_categories_order ON categories (order_index);
CREATE INDEX idx_services_active ON services (is_active);
CREATE INDEX idx_services_order ON services (order_index);
CREATE INDEX idx_site_content_key ON site_content (key);
CREATE INDEX idx_testimonials_featured ON testimonials (is_featured);
CREATE INDEX idx_testimonials_order ON testimonials (order_index);
CREATE INDEX idx_faq_active ON faq (is_active);
CREATE INDEX idx_faq_category ON faq (category);
CREATE INDEX idx_faq_order ON faq (order_index);