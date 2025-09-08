import { solutionsStore } from '@/data/solutionsStore';
import { DEFAULT_SOLUTIONS_CONFIG } from '@/types/solutions';
import { migrateTags } from './tagMigration';

export interface TagFilter {
  label: string;
  slug: string;
}

/**
 * Gets available tags from solutions store with fallback to static categories
 * Always includes 'all' option and maintains backward compatibility
 */
export function getAvailableTags(): TagFilter[] {
  try {
    // Get solutions configuration - this is the ONLY source of truth for tags
    const solutionsConfig = solutionsStore.safeGetConfigOrDefaults();
    
    // Start with 'all' option
    const tags: TagFilter[] = [{ label: 'הכל', slug: 'all' }];
    
    // Add enabled solutions as tags - solutions are the ONLY valid tags
    const solutionTags = solutionsConfig.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        label: item.title,
        slug: item.id
      }));
    
    tags.push(...solutionTags);
    
    return tags;
  } catch (error) {
    console.warn('Failed to load tags from solutions, using default solutions:', error);
    // Even on error, use solutions as fallback - never use legacy categoryFilters
    const solutionTags = DEFAULT_SOLUTIONS_CONFIG.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        label: item.title,
        slug: item.id
      }));
    
    return [{ label: 'הכל', slug: 'all' }, ...solutionTags];
  }
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
  
  // Filter only valid tags that exist in solutions after migration
  const validTags = migratedTags.filter(tag => availableSlugs.has(tag));
  
  // If no valid tags, add fallback (ensure fallback exists in solutions)
  if (validTags.length === 0) {
    return availableSlugs.has(fallbackCategory) ? [fallbackCategory] : [Array.from(availableSlugs)[0]];
  }
  
  return validTags;
}

/**
 * Gets all valid tag slugs that can be used for projects
 * Only tags from enabled solutions are valid
 */
export function getValidTagSlugs(): string[] {
  const availableTags = getAvailableTags();
  return availableTags.map(t => t.slug).filter(s => s !== 'all');
}