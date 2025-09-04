-- Phase 1: Critical Database Security Fixes

-- 1. Fix Landing Texts Access Control - Replace permissive policies with admin-only access
DROP POLICY IF EXISTS "Admins can delete landing texts" ON public.landing_texts;
DROP POLICY IF EXISTS "Admins can insert landing texts" ON public.landing_texts;
DROP POLICY IF EXISTS "Admins can manage landing texts" ON public.landing_texts;
DROP POLICY IF EXISTS "Admins can update landing texts" ON public.landing_texts;

-- Create proper admin-only policies for landing_texts
CREATE POLICY "Only verified admins can select landing texts" 
ON public.landing_texts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Only verified admins can insert landing texts" 
ON public.landing_texts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Only verified admins can update landing texts" 
ON public.landing_texts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Only verified admins can delete landing texts" 
ON public.landing_texts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

-- 2. Add Missing RLS Policies for Background Images
CREATE POLICY "Public can view active background images" 
ON public.background_images 
FOR SELECT 
USING (active = true);

CREATE POLICY "Only verified admins can manage background images" 
ON public.background_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

-- 3. Secure Admin User Data - Remove user access to their own records (too permissive)
DROP POLICY IF EXISTS "Users can access their own rows" ON public.admin_users;

-- Only super admin can access admin user data
-- The "Super admin can access all rows" policy already exists and is sufficient

-- 4. Fix Database Function Security - Add proper search_path
CREATE OR REPLACE FUNCTION public.get_admin_user(user_id_param uuid)
RETURNS TABLE(email text, user_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email, user_id FROM public.admin_users 
  WHERE user_id = user_id_param;
$$;