-- Create clients table for client management
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  business_type text NOT NULL,
  package_type text NOT NULL DEFAULT 'חבילת התנסות',
  monthly_savings integer DEFAULT 0,
  status text NOT NULL DEFAULT 'פעיל',
  signup_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create client_images table for managing client images
CREATE TABLE public.client_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  dish_name text NOT NULL,
  image_before text,
  image_after text NOT NULL,
  category text NOT NULL DEFAULT 'restaurants',
  service_type text NOT NULL DEFAULT 'תמונות',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
CREATE POLICY "Admin users can manage clients"
ON public.clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
));

-- Create RLS policies for client_images table  
CREATE POLICY "Admin users can manage client images"
ON public.client_images
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_business_type ON public.clients(business_type);
CREATE INDEX idx_client_images_client_id ON public.client_images(client_id);
CREATE INDEX idx_client_images_category ON public.client_images(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_images_updated_at  
  BEFORE UPDATE ON public.client_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();