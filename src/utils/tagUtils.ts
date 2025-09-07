import { solutionsStore } from '@/data/solutionsStore';
import { categoryFilters } from '@/data/portfolioMock';

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
    // Get solutions configuration
    const solutionsConfig = solutionsStore.safeGetConfigOrDefaults();
    
    // Start with 'all' option
    const tags: TagFilter[] = [{ label: 'הכל', slug: 'all' }];
    
    // Add enabled solutions as tags
    const solutionTags = solutionsConfig.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        label: item.title,
        slug: item.id
      }));
    
    tags.push(...solutionTags);
    
    // Add any legacy tags that might exist in projects but not in solutions
    const solutionSlugs = new Set(solutionTags.map(tag => tag.slug));
    const legacyTags = categoryFilters
      .filter(cat => cat.slug !== 'all' && !solutionSlugs.has(cat.slug))
      .map(cat => ({ label: cat.label, slug: cat.slug }));
    
    if (legacyTags.length > 0) {
      tags.push(...legacyTags);
    }
    
    return tags;
  } catch (error) {
    console.warn('Failed to load dynamic tags, falling back to static categories:', error);
    return categoryFilters;
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
 */
export function syncProjectTags(projectTags: string[] = [], fallbackCategory: string = 'restaurants'): string[] {
  const availableTags = getAvailableTags();
  const availableSlugs = new Set(availableTags.map(t => t.slug).filter(s => s !== 'all'));
  
  // Filter valid tags
  const validTags = projectTags.filter(tag => availableSlugs.has(tag));
  
  // If no valid tags, add fallback
  if (validTags.length === 0) {
    return availableSlugs.has(fallbackCategory) ? [fallbackCategory] : [Array.from(availableSlugs)[0]];
  }
  
  return validTags;
}