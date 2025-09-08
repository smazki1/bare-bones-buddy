-- Drop all existing storage policies to clean slate
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;
DROP POLICY IF EXISTS "Dishes public read" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload dishes" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage dishes" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete dishes" ON storage.objects;

-- Drop any other existing policies
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Dishes are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own portfolio images" ON storage.objects;

-- Create clean, optimized policies for instant loading
CREATE POLICY "portfolio_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "dishes_public_read" ON storage.objects  
FOR SELECT USING (bucket_id = 'dishes');

CREATE POLICY "portfolio_admin_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "dishes_admin_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'dishes' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "portfolio_admin_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "dishes_admin_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'dishes' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "portfolio_admin_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "dishes_admin_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'dishes' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);