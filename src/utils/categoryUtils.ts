import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryForBusinessSolutions, TagFilter } from '@/types/categories';

/**
 * Fetches active categories from the database
 */
export async function fetchActiveCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching categories:', error);
    return [];
  }
}

/**
 * Transforms database categories into format needed for BusinessSolutionsSection
 */
export function transformCategoriesToSolutions(categories: Category[]): CategoryForBusinessSolutions[] {
  return categories.map(category => ({
    id: category.slug,
    title: category.name,
    imageSrc: category.icon_url || '/placeholder.svg',
    videoSrc: undefined, // Categories don't have videos yet
    href: `/portfolio?tag=${category.slug}`,
    tagSlug: category.slug,
    enabled: category.is_active,
    order: category.order_index
  }));
}

/**
 * Gets available tags from database categories
 * Always includes 'all' option and maintains backward compatibility
 */
export async function getAvailableTagsFromDB(): Promise<TagFilter[]> {
  try {
    const categories = await fetchActiveCategories();
    
    // Start with 'all' option
    const tags: TagFilter[] = [{ label: 'הכל', slug: 'all' }];
    
    // Add categories as tags
    const categoryTags = categories.map(category => ({
      label: category.name,
      slug: category.slug
    }));
    
    tags.push(...categoryTags);
    
    return tags;
  } catch (error) {
    console.warn('Failed to load tags from database, using fallback:', error);
    return [{ label: 'הכל', slug: 'all' }];
  }
}

/**
 * Gets available tags synchronously (for backward compatibility)
 * This will be used as fallback when async fetch fails
 */
export function getAvailableTagsSync(): TagFilter[] {
  // Fallback to basic categories when database is not available
  return [
    { label: 'הכל', slug: 'all' },
    { label: 'מסעדות', slug: 'restaurants' },
    { label: 'מאפיות', slug: 'bakeries' },
    { label: 'אוכל מהיר', slug: 'fast-food' },
    { label: 'קייטרינג', slug: 'catering' }
  ];
}

/**
 * Gets tag label by slug from database categories
 */
export async function getTagLabelFromDB(slug: string): Promise<string> {
  if (slug === 'all') return 'הכל';
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn(`Tag not found for slug: ${slug}`);
      return slug;
    }

    return data.name;
  } catch (error) {
    console.warn(`Error fetching tag label for slug: ${slug}`, error);
    return slug;
  }
}

/**
 * Validates if a tag exists in database categories
 */
export async function isValidTagFromDB(slug: string): Promise<boolean> {
  if (slug === 'all') return true;
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.warn(`Error validating tag: ${slug}`, error);
    return false;
  }
}

/**
 * Gets all valid tag slugs from database
 */
export async function getValidTagSlugsFromDB(): Promise<string[]> {
  try {
    const categories = await fetchActiveCategories();
    return categories.map(category => category.slug);
  } catch (error) {
    console.warn('Error fetching valid tag slugs:', error);
    return ['restaurants', 'bakeries', 'fast-food', 'catering'];
  }
}