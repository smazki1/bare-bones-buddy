-- Add RLS policies for admin users to manage projects
-- Allow admin users to insert projects  
CREATE POLICY "Admin users can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Allow admin users to update projects
CREATE POLICY "Admin users can update projects" 
ON public.projects 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Allow admin users to delete projects  
CREATE POLICY "Admin users can delete projects" 
ON public.projects 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);