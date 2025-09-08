-- Ensure all storage buckets are properly configured for direct web access
-- and have optimal RLS policies for public access

-- Check and update portfolio bucket to be public with proper settings
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 10485760, -- 10MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
WHERE id = 'portfolio';

-- Ensure dishes bucket is optimally configured
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
WHERE id = 'dishes';

-- Create optimized RLS policies for fastest public access
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Dishes are publicly accessible" ON storage.objects;

-- Ultra-fast public read policies
CREATE POLICY "Portfolio images public read" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Dishes public read" ON storage.objects  
FOR SELECT USING (bucket_id = 'dishes');

-- Admin upload policies
CREATE POLICY "Admin upload portfolio" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin upload dishes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'dishes' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Admin update/delete policies  
CREATE POLICY "Admin manage portfolio" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin delete portfolio" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin manage dishes" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'dishes' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin delete dishes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'dishes' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);