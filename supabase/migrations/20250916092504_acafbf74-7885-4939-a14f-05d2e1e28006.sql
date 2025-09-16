-- Create storage policies for project-images bucket admin access
CREATE POLICY "Admin can upload to project-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-images' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid())
);

CREATE POLICY "Admin can update project-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-images' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid())
);

CREATE POLICY "Admin can delete project-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-images' AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid())
);