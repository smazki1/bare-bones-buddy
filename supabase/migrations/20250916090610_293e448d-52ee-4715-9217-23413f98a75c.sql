-- Drop existing policy
DROP POLICY IF EXISTS "Super admin can access all rows" ON public.admin_users;

-- Create new policy that allows access for both admin emails and authenticated users checking their own admin status
CREATE POLICY "Admin users can access admin table" ON public.admin_users
FOR ALL USING (
  auth.jwt() ->> 'email' = 'admin@foodvision.com' OR
  auth.jwt() ->> 'email' = 'admin@food-vision.co.il' OR
  auth.uid() = user_id
);

-- Ensure the admin user exists with the correct email
INSERT INTO public.admin_users (user_id, email) 
VALUES ('ce5cdd26-2cff-4253-ab57-7d5dd28cfdc6', 'admin@foodvision.com')
ON CONFLICT (user_id) DO UPDATE SET email = 'admin@foodvision.com';