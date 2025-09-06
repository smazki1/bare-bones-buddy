export interface VisualSolutionCard {
  id: string;
  title: string;
  imageSrc: string;
  videoSrc?: string;
  href?: string;
  tagSlug?: string;
  enabled: boolean;
  order: number;
}

export interface VisualSolutionsConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  items: VisualSolutionCard[];
  updatedAt?: string;
}

export const DEFAULT_VISUAL_SOLUTIONS_CONFIG: VisualSolutionsConfig = {
  sectionTitle: 'כל מה שאתם צריכים ליצירת תוכן ויזואלי במקום אחד',
  sectionSubtitle: 'פתרונות מקצועיים לכל הצרכים הויזואליים שלכם',
  items: [
    {
      id: 'menu-photos',
      title: 'תמונות תפריט',
      imageSrc: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/services',
      enabled: true,
      order: 0,
    },
    {
      id: 'social-content',
      title: 'תוכן רשתות חברתיות',
      imageSrc: 'https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/services',
      enabled: true,
      order: 1,
    },
    {
      id: 'short-videos',
      title: 'סרטונים קצרים',
      imageSrc: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/services',
      enabled: true,
      order: 2,
    },
    {
      id: 'product-catalog',
      title: 'קטלוג מוצרים',
      imageSrc: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/services',
      enabled: true,
      order: 3,
    },
    {
      id: 'ambiance-photos',
      title: 'תמונות אווירה',
      imageSrc: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/services',
      enabled: true,
      order: 4,
    },
  ],
  updatedAt: new Date().toISOString(),
};