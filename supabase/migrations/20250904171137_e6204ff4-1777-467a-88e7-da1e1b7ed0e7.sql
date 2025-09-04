-- Add user as admin
INSERT INTO public.admin_users (user_id, email)
VALUES ('3cd0c067-cc3e-4e55-9999-438c0b013d45', 'avifrid121@gmail.com')
ON CONFLICT (email) DO UPDATE SET 
  user_id = EXCLUDED.user_id;