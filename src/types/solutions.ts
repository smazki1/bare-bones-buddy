export type SolutionCard = {
  id: string;           // stable slug (e.g., 'restaurants')
  title: string;        // Hebrew, RTL
  imageSrc?: string;    // URL or data URL (poster when video exists)
  videoSrc?: string;    // mp4/webm URL or data URL (optional)
  tagSlug?: string;     // e.g., 'restaurants'
  href?: string | null; // e.g., `/portfolio?tag=restaurants`; nullable => non-clickable
  enabled: boolean;     // default true
  order: number;        // sort index
};

export type SolutionsConfig = {
  sectionTitle: string;     // default: "פתרונות מותאמים לכל עסק"
  sectionSubtitle: string;  // short supporting line
  items: SolutionCard[];
  updatedAt: string;        // ISO
};

export const DEFAULT_SOLUTIONS_CONFIG: SolutionsConfig = {
  sectionTitle: "פתרונות מותאמים לכל עסק",
  sectionSubtitle: "מתמחים ביצירת תוכן ויזואלי מקצועי שמתאים בדיוק לסגנון ולצרכים של העסק שלכם",
  items: [
    {
      id: 'restaurants',
      title: 'מסעדות ובתי קפה',
      imageSrc: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'restaurants',
      href: '/portfolio?tag=restaurants',
      enabled: true,
      order: 0
    },
    {
      id: 'bakeries',
      title: 'מאפיות ועוגות',
      imageSrc: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'bakeries',
      href: '/portfolio?tag=bakeries',
      enabled: true,
      order: 1
    },
    {
      id: 'confectioneries',
      title: 'קונדיטוריות',
      imageSrc: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'confectioneries',
      href: '/portfolio?tag=confectioneries',
      enabled: true,
      order: 2
    },
    {
      id: 'fast-food',
      title: 'אוכל מהיר ופיצה',
      imageSrc: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'fast-food',
      href: '/portfolio?tag=fast-food',
      enabled: true,
      order: 3
    },
    {
      id: 'home-cooking',
      title: 'אוכל ביתי',
      imageSrc: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'home-cooking',
      href: '/portfolio?tag=home-cooking',
      enabled: true,
      order: 4
    },
    {
      id: 'catering',
      title: 'קייטרינג ואירועים',
      imageSrc: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'catering',
      href: '/portfolio?tag=catering',
      enabled: true,
      order: 5
    },
    {
      id: 'branding',
      title: 'מיתוג ואריזות',
      imageSrc: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'branding',
      href: '/portfolio?tag=branding',
      enabled: true,
      order: 6
    },
    {
      id: 'coffee',
      title: 'קפה ומשקאות',
      imageSrc: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'coffee',
      href: '/portfolio?tag=coffee',
      enabled: true,
      order: 7
    },
    {
      id: 'sushi',
      title: 'סושי',
      imageSrc: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'sushi',
      href: '/portfolio?tag=sushi',
      enabled: true,
      order: 8
    },
    {
      id: 'products',
      title: 'מוצרים וממרחים',
      imageSrc: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'products',
      href: '/portfolio?tag=products',
      enabled: true,
      order: 9
    },
    {
      id: 'jewelry',
      title: 'תכשיטים',
      imageSrc: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'jewelry',
      href: '/portfolio?tag=jewelry',
      enabled: true,
      order: 10
    }
  ],
  updatedAt: new Date().toISOString()
};