-- Add new user as admin
INSERT INTO public.admin_users (user_id, email)
VALUES ('657a6250-3d2e-4583-9be3-cb37ff499879', 'avifrid121@gmail.com')
ON CONFLICT (email) DO UPDATE SET 
  user_id = EXCLUDED.user_id;