-- Add a new admin user with a simple email and password
INSERT INTO admin_users (email, user_id) 
VALUES ('admin@foodvision.com', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (email) DO NOTHING;