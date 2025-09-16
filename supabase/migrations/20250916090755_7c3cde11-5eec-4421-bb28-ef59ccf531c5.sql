-- Drop all existing policies on admin_users table
DROP POLICY IF EXISTS "Super admin can access all rows" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can access admin table" ON public.admin_users;

-- Create new comprehensive policy for admin users
CREATE POLICY "Admin access policy" ON public.admin_users
FOR ALL USING (
  auth.jwt() ->> 'email' = 'admin@foodvision.com' OR
  auth.jwt() ->> 'email' = 'admin@food-vision.co.il' OR 
  user_id = auth.uid()
);

-- Make sure RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;