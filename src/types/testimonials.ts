export interface Testimonial {
  id: string;
  business_name: string;
  category: string;
  image_url: string;
  link_instagram?: string | null;
  link_facebook?: string | null;
  link_x?: string | null;
  enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
