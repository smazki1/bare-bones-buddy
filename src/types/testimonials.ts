export interface Testimonial {
  id: string;
  client_name: string;
  client_business?: string;
  content: string;
  rating: number;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}