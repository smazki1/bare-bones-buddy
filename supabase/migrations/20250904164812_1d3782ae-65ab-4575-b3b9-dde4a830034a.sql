-- Add trigger to automatically update admin_users when new users sign up with pre-approved emails

CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email exists in admin_users with placeholder UUID
  UPDATE public.admin_users 
  SET user_id = NEW.id 
  WHERE email = NEW.email 
  AND user_id = '00000000-0000-0000-0000-000000000000';
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user signup
DROP TRIGGER IF EXISTS on_auth_user_created_admin_update ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_update
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();