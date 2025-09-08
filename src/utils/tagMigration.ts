/**
 * Tag migration utilities to handle merging duplicate/overlapping categories
 */

// Map old/duplicate tags to new consolidated tags
export const TAG_MIGRATION_MAP: Record<string, string> = {
  // Merge pizza into fast-food
  'pizza': 'fast-food',
  
  // Merge cakes into bakeries
  'cakes': 'bakeries',
  
  // Merge cafes into coffee
  'cafes': 'coffee',
  
  // Merge spreads into products
  'spreads': 'products',
  
  // Merge ambiance into restaurants (atmosphere is part of restaurant branding)
  'ambiance': 'restaurants',
  
  // Map legacy categories from portfolio mock
  'bars': 'coffee', // bars serve drinks, similar to coffee shops
  'delicatessen': 'products', // specialty food products
  'premium': 'branding', // premium products are about branding
  'manufacturers': 'products', // manufacturers make products
};

/**
 * Migrates old/duplicate tags to new consolidated tags
 */
export function migrateTag(oldTag: string): string {
  return TAG_MIGRATION_MAP[oldTag] || oldTag;
}

/**
 * Migrates an array of tags, removing duplicates after migration
 */
export function migrateTags(tags: string[]): string[] {
  const migratedTags = tags.map(migrateTag);
  return [...new Set(migratedTags)]; // Remove duplicates
}

/**
 * Gets all valid tag slugs after migration
 */
export function getAllValidTagsAfterMigration(): string[] {
  return [
    'restaurants',
    'bakeries', 
    'confectioneries',
    'fast-food',
    'home-cooking',
    'catering',
    'branding',
    'coffee',
    'sushi',
    'products',
    'jewelry'
  ];
}