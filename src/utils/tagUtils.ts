import { getAvailableTagsFromDB, getAvailableTagsSync } from '@/utils/categoryUtils';
import { TagFilter } from '@/types/categories';
import { migrateTags } from './tagMigration';

// Cache for tags to avoid repeated database calls
let cachedTags: TagFilter[] | null = null;
let lastFetchTime = 0;
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Gets available tags from database categories with caching
 * Always includes 'all' option and maintains backward compatibility
 */
export function getAvailableTags(): TagFilter[] {
  // Return cached tags if still valid
  if (cachedTags && Date.now() - lastFetchTime < CACHE_TIMEOUT) {
    return cachedTags;
  }

  // Try to get fresh tags from database asynchronously
  getAvailableTagsFromDB().then(tags => {
    cachedTags = tags;
    lastFetchTime = Date.now();
    // Trigger update event for components listening
    window.dispatchEvent(new CustomEvent('categories:updated'));
  }).catch(error => {
    console.warn('Failed to fetch tags from database:', error);
  });

  // Return cached tags or sync fallback
  return cachedTags || getAvailableTagsSync();
}

/**
 * Gets tag label by slug, with fallback to slug if not found
 */
export function getTagLabel(slug: string): string {
  const availableTags = getAvailableTags();
  const tag = availableTags.find(t => t.slug === slug);
  return tag?.label || slug;
}

/**
 * Validates if a tag exists in available tags
 */
export function isValidTag(slug: string): boolean {
  const availableTags = getAvailableTags();
  return availableTags.some(t => t.slug === slug);
}

/**
 * Syncs project tags to ensure they're valid and adds missing categories
 * Also migrates old/duplicate tags to new consolidated tags
 */
export function syncProjectTags(projectTags: string[] = [], fallbackCategory: string = 'restaurants'): string[] {
  const availableTags = getAvailableTags();
  const availableSlugs = new Set(availableTags.map(t => t.slug).filter(s => s !== 'all'));
  
  // First migrate old/duplicate tags to new consolidated tags
  const migratedTags = migrateTags(projectTags);
  
  // Filter only valid tags that exist in categories after migration
  const validTags = migratedTags.filter(tag => availableSlugs.has(tag));
  
  // If no valid tags, add fallback (ensure fallback exists in categories)
  if (validTags.length === 0) {
    return availableSlugs.has(fallbackCategory) ? [fallbackCategory] : [Array.from(availableSlugs)[0]];
  }
  
  return validTags;
}

/**
 * Gets all valid tag slugs that can be used for projects
 * Only tags from enabled categories are valid
 */
export function getValidTagSlugs(): string[] {
  const availableTags = getAvailableTags();
  return availableTags.map(t => t.slug).filter(s => s !== 'all');
}

// Re-export TagFilter interface for backward compatibility
export type { TagFilter };