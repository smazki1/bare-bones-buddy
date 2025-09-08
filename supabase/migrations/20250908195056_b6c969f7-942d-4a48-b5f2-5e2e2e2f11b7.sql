-- Fix security issues with RLS policies

-- 1. Fix site_configs table - restrict write access to admin users only
DROP POLICY IF EXISTS "site_configs_update_anon" ON public.site_configs;
DROP POLICY IF EXISTS "site_configs_update_authenticated" ON public.site_configs;
DROP POLICY IF EXISTS "site_configs_write_anon" ON public.site_configs;
DROP POLICY IF EXISTS "site_configs_write_authenticated" ON public.site_configs;

-- Allow only admin users to modify site configurations
CREATE POLICY "Admin users can update site configs" ON public.site_configs
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can insert site configs" ON public.site_configs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

-- 2. Enhance clients table security with additional verification
-- Create a more secure admin verification function that includes email verification
CREATE OR REPLACE FUNCTION public.verify_admin_user(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_id_param
    AND email IS NOT NULL
    AND email != ''
  );
$$;

-- Update clients table policy to use enhanced verification
DROP POLICY IF EXISTS "Admin users can manage clients" ON public.clients;

CREATE POLICY "Verified admin users can manage clients" ON public.clients
FOR ALL USING (
  public.verify_admin_user(auth.uid())
) WITH CHECK (
  public.verify_admin_user(auth.uid())
);

-- 3. Apply same enhanced security to client_images table
DROP POLICY IF EXISTS "Admin users can manage client images" ON public.client_images;

CREATE POLICY "Verified admin users can manage client images" ON public.client_images
FOR ALL USING (
  public.verify_admin_user(auth.uid())
) WITH CHECK (
  public.verify_admin_user(auth.uid())
);

-- Add audit logging for sensitive operations (optional enhancement)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin users can read audit logs
CREATE POLICY "Admin users can read audit logs" ON public.audit_log
FOR SELECT USING (
  public.verify_admin_user(auth.uid())
);