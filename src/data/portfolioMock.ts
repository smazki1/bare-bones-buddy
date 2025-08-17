export type ProjectSize = 'small' | 'medium' | 'large';

export type Project = {
  id: string | number;
  businessName: string;
  businessType: string;
  serviceType: 'תמונות' | 'סרטונים';
  imageAfter: string;
  imageBefore?: string;
  size: ProjectSize;
  category: string;
};

// Mock portfolio data with varied sizes and categories
export const portfolioMockData: Project[] = [
  // Restaurants
  {
    id: 1,
    businessName: "מסעדת הזית הזהב",
    businessType: "מסעדה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "large",
    category: "restaurants"
  },
  {
    id: 2,
    businessName: "ביסטרו התבלינים",
    businessType: "מסעדה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "restaurants"
  },
  {
    id: 3,
    businessName: "מסעדת הים התיכון",
    businessType: "מסעדה",
    serviceType: "סרטונים",
    imageAfter: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "small",
    category: "restaurants"
  },
  {
    id: 4,
    businessName: "פיצריית נפולי",
    businessType: "מסעדה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "restaurants"
  },

  // Bakeries
  {
    id: 5,
    businessName: "מאפיית השבת",
    businessType: "מאפייה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "large",
    category: "bakeries"
  },
  {
    id: 6,
    businessName: "לחם וחברים",
    businessType: "מאפייה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "small",
    category: "bakeries"
  },
  {
    id: 7,
    businessName: "מאפיית הכפר",
    businessType: "מאפייה",
    serviceType: "סרטונים",
    imageAfter: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "bakeries"
  },

  // Confectioneries
  {
    id: 8,
    businessName: "קונדיטוריית הענן",
    businessType: "קונדיטוריה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "large",
    category: "confectioneries"
  },
  {
    id: 9,
    businessName: "עוגות אמא",
    businessType: "קונדיטוריה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "confectioneries"
  },

  // Delis
  {
    id: 10,
    businessName: "מעדניית הטעמים",
    businessType: "מעדנייה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "small",
    category: "delis"
  },
  {
    id: 11,
    businessName: "דלי הגבינות",
    businessType: "מעדנייה",
    serviceType: "סרטונים",
    imageAfter: "https://images.unsplash.com/photo-1552009392-45f4b7bb4530?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1552009392-45f4b7bb4530?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "delis"
  },

  // Bars
  {
    id: 12,
    businessName: "בר השקיעה",
    businessType: "בר",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "large",
    category: "bars"
  },
  {
    id: 13,
    businessName: "קוקטיילים ועוד",
    businessType: "בר",
    serviceType: "סרטונים",
    imageAfter: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "small",
    category: "bars"
  },

  // Fast Food
  {
    id: 14,
    businessName: "בורגר שף",
    businessType: "אוכל מהיר",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "fast-food"
  },
  {
    id: 15,
    businessName: "פלאפל הבית",
    businessType: "אוכל מהיר",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "small",
    category: "fast-food"
  },

  // Branded Products
  {
    id: 16,
    businessName: "מותג הטעם",
    businessType: "מוצרים ממותגים",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "large",
    category: "branded-products"
  },
  {
    id: 17,
    businessName: "אריזות פרימיום",
    businessType: "מוצרים ממותגים",
    serviceType: "סרטונים",
    imageAfter: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "branded-products"
  },

  // Catering
  {
    id: 18,
    businessName: "קייטרינג הארועים",
    businessType: "קייטרינג",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "large",
    category: "catering"
  },
  {
    id: 19,
    businessName: "מגשי השף",
    businessType: "קייטרינג",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1515669097368-22e68ac2d265?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1515669097368-22e68ac2d265?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "small",
    category: "catering"
  },

  // Additional items to reach 60+ items
  {
    id: 20,
    businessName: "מסעדת הנמל",
    businessType: "מסעדה",
    serviceType: "תמונות",
    imageAfter: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    imageBefore: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&blur=8",
    size: "medium",
    category: "restaurants"
  }
  // ... continue generating more items to reach 60-80 total
];

// Generate additional items programmatically
const additionalItems: Project[] = [];
const baseItems = portfolioMockData.slice(0, 20);

for (let i = 21; i <= 80; i++) {
  const baseItem = baseItems[(i - 21) % baseItems.length];
  additionalItems.push({
    ...baseItem,
    id: i,
    businessName: `${baseItem.businessName} ${Math.floor(i / 20) + 1}`,
  });
}

export const fullPortfolioData = [...portfolioMockData, ...additionalItems];

// Category mappings
export const categoryFilters = [
  { label: 'הכל', slug: 'all' },
  { label: 'מסעדות', slug: 'restaurants' },
  { label: 'מאפיות', slug: 'bakeries' },
  { label: 'קונדיטוריות', slug: 'confectioneries' },
  { label: 'מעדניות', slug: 'delis' },
  { label: 'ברים', slug: 'bars' },
  { label: 'אוכל מהיר', slug: 'fast-food' },
  { label: 'מוצרים ממותגים', slug: 'branded-products' },
  { label: 'קייטרינג', slug: 'catering' },
];