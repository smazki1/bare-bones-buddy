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
      title: 'מאפיות וקונדיטוריות',
      imageSrc: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'bakeries',
      href: '/portfolio?tag=bakeries',
      enabled: true,
      order: 1
    },
    {
      id: 'fast-food',
      title: 'אוכל מהיר ורשתות',
      imageSrc: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'fast-food',
      href: '/portfolio?tag=fast-food',
      enabled: true,
      order: 2
    },
    {
      id: 'premium',
      title: 'מוצרי יוקרה וקייטרינג',
      imageSrc: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      tagSlug: 'premium',
      href: '/portfolio?tag=premium',
      enabled: true,
      order: 3
    }
  ],
  updatedAt: new Date().toISOString()
};