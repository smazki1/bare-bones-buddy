export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CategoryForBusinessSolutions {
  id: string;
  title: string;
  imageSrc?: string;
  videoSrc?: string;
  href?: string;
  tagSlug: string;
  enabled: boolean;
  order: number;
}

export interface TagFilter {
  label: string;
  slug: string;
}