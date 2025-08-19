export type MarketTag = {
  id: string;       // stable
  label: string;    // Hebrew
  slug: string;     // e.g., 'restaurants'
  enabled: boolean; // default true
  order: number;    // for sorting
};

export type MarketsConfig = {
  sectionTitle: string;     // default: "שווקים שאנו עובדים איתם"
  sectionSubtitle: string;  // short supporting line
  items: MarketTag[];
  updatedAt: string;        // ISO
};

export const DEFAULT_MARKETS_CONFIG: MarketsConfig = {
  sectionTitle: "שווקים שאנו עובדים איתם",
  sectionSubtitle: "אנחנו מתמחים בסוגי מוצרים ושירותים מגוונים בתחום המזון",
  items: [
    {
      id: 'restaurants',
      label: 'מנות מסעדות',
      slug: 'restaurants',
      enabled: true,
      order: 0
    },
    {
      id: 'bakeries',
      label: 'מאפים',
      slug: 'bakeries',
      enabled: true,
      order: 1
    },
    {
      id: 'drinks',
      label: 'משקאות',
      slug: 'drinks',
      enabled: true,
      order: 2
    },
    {
      id: 'catering',
      label: 'מגשי אירוח',
      slug: 'catering',
      enabled: true,
      order: 3
    },
    {
      id: 'fruit-platters',
      label: 'מגשי פירות',
      slug: 'fruit-platters',
      enabled: true,
      order: 4
    },
    {
      id: 'branded-products',
      label: 'מוצרים ממותגים',
      slug: 'branded-products',
      enabled: true,
      order: 5
    }
  ],
  updatedAt: new Date().toISOString()
};