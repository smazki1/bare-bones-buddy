-- Create testimonials table for managing "our clients" section
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  link_instagram text,
  link_facebook text,
  link_x text,
  enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can view only enabled testimonials
CREATE POLICY "Public can view enabled testimonials"
ON public.testimonials
FOR SELECT
USING (enabled = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_testimonials_enabled ON public.testimonials(enabled);
CREATE INDEX idx_testimonials_display_order ON public.testimonials(display_order);

-- Trigger to update updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();