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
  sectionTitle: "השירות שלנו מותאם לכל התעשיות",
  sectionSubtitle: "בין אם אתה בעל מסעדה, מנהל בחנות אונליין, או מפיק אירועים - אנחנו יוצרים תמונות מקצועיות בשבריר מהמחיר לכל מטרה",
  items: [
    {
      id: 'restaurants',
      label: 'מסעדות',
      slug: 'restaurants',
      enabled: true,
      order: 0
    },
    {
      id: 'bakeries',
      label: 'מאפיות',
      slug: 'bakeries',
      enabled: true,
      order: 1
    },
    {
      id: 'bars',
      label: 'ברים',
      slug: 'bars',
      enabled: true,
      order: 2
    },
    {
      id: 'cafes',
      label: 'קפה ומשקאות',
      slug: 'cafes',
      enabled: true,
      order: 3
    },
    {
      id: 'fast-food',
      label: 'אוכל מהיר',
      slug: 'fast-food',
      enabled: true,
      order: 4
    },
    {
      id: 'confectioneries',
      label: 'קונדיטוריות',
      slug: 'confectioneries',
      enabled: true,
      order: 5
    },
    {
      id: 'delicatessen',
      label: 'מעדניות',
      slug: 'delicatessen',
      enabled: true,
      order: 6
    },
    {
      id: 'catering',
      label: 'קייטרינג',
      slug: 'catering',
      enabled: true,
      order: 7
    },
    {
      id: 'premium',
      label: 'מוצרי יוקרה',
      slug: 'premium',
      enabled: true,
      order: 8
    },
    {
      id: 'manufacturers',
      label: 'יצרנים',
      slug: 'manufacturers',
      enabled: true,
      order: 9
    }
  ],
  updatedAt: new Date().toISOString()
};