-- Link admin account after login without touching auth schema
-- Create a SECURITY DEFINER function that binds the logged-in user to admin_users by email
create or replace function public.link_admin_user()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Update admin_users.user_id to the current auth user where email matches and placeholder UUID is present
  update public.admin_users
  set user_id = auth.uid()
  where email = (auth.jwt() ->> 'email')
    and user_id = '00000000-0000-0000-0000-000000000000';

  return found;
end;
$$;

-- Allow authenticated users to execute this function
grant execute on function public.link_admin_user() to authenticated;
