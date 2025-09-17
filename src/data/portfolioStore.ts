import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'
import { fetchActiveCategories } from '@/utils/categoryUtils'

export interface Project {
  id: string;
  businessName: string;
  businessType?: string;
  serviceType: 'תמונות' | 'סרטונים';
  imageAfter: string;
  imageBefore?: string;
  size: 'small' | 'medium' | 'large';
  category: string;
  tags?: string[];
  pinned?: boolean;
  createdAt?: string;
}

interface PortfolioStore {
  projects: Project[]
  featuredProjects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  fetchFeaturedProjects: () => Promise<void>
  refreshOnCategoryUpdate: () => void
}

// Helper function to determine size based on index or random assignment
const getRandomSize = (): 'small' | 'medium' | 'large' => {
  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

// Cache for category mapping
let categoryIdToSlugMap: Map<string, string> = new Map();
let categoryMapLastFetch = 0;
const CATEGORY_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Helper function to get category slug mapping
const getCategoryMapping = async (): Promise<Map<string, string>> => {
  // Return cached mapping if still valid
  if (categoryIdToSlugMap.size > 0 && Date.now() - categoryMapLastFetch < CATEGORY_CACHE_TIMEOUT) {
    return categoryIdToSlugMap;
  }

  try {
    const categories = await fetchActiveCategories();
    const newMap = new Map<string, string>();
    
    categories.forEach(category => {
      newMap.set(category.id, category.slug);
    });
    
    categoryIdToSlugMap = newMap;
    categoryMapLastFetch = Date.now();
    
    return newMap;
  } catch (error) {
    console.warn('Failed to fetch category mapping:', error);
    return categoryIdToSlugMap; // Return existing map even if fetch failed
  }
};

// Helper function to map category IDs to category slugs
const getCategoryFromIds = async (categoryIds: string[]): Promise<{ category: string; tags: string[] }> => {
  if (!categoryIds || categoryIds.length === 0) {
    return { category: 'restaurants', tags: ['restaurants'] }; // Default fallback
  }

  try {
    const categoryMap = await getCategoryMapping();
    const slugs = categoryIds
      .map(id => categoryMap.get(id))
      .filter(slug => slug !== undefined) as string[];
    
    // If no valid slugs found, use fallback
    if (slugs.length === 0) {
      return { category: 'restaurants', tags: ['restaurants'] };
    }
    
    return {
      category: slugs[0], // Use first category as primary category
      tags: slugs // All categories as tags for filtering
    };
  } catch (error) {
    console.warn('Error mapping category IDs:', error);
    return { category: 'restaurants', tags: ['restaurants'] };
  }
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  projects: [],
  featuredProjects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      
      // Transform database data to match portfolio interface
      const transformedProjects: Project[] = [];
      
      for (const dbProject of data || []) {
        const categoryInfo = await getCategoryFromIds(dbProject.category_ids || []);
        
        transformedProjects.push({
          id: dbProject.id,
          businessName: dbProject.title,
          businessType: 'מסעדה', // Default business type
          serviceType: 'תמונות' as const,
          imageAfter: dbProject.image_after_url,
          imageBefore: dbProject.image_before_url || undefined,
          size: getRandomSize(),
          category: categoryInfo.category,
          tags: categoryInfo.tags,
          createdAt: dbProject.created_at
        });
      }
      
      set({ projects: transformedProjects, loading: false })
    } catch (error) {
      console.error('Error fetching projects:', error)
      set({ error: 'Failed to fetch projects', loading: false })
    }
  },

  fetchFeaturedProjects: async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('order_index', { ascending: true })
        .limit(6)
      
      if (error) throw error
      
      // Transform database data to match portfolio interface
      const transformedProjects: Project[] = [];
      
      for (const dbProject of data || []) {
        const categoryInfo = await getCategoryFromIds(dbProject.category_ids || []);
        
        transformedProjects.push({
          id: dbProject.id,
          businessName: dbProject.title,
          businessType: 'מסעדה',
          serviceType: 'תמונות' as const,
          imageAfter: dbProject.image_after_url,
          imageBefore: dbProject.image_before_url || undefined,
          size: getRandomSize(),
          category: categoryInfo.category,
          tags: categoryInfo.tags,
          createdAt: dbProject.created_at
        });
      }
      
      set({ featuredProjects: transformedProjects })
    } catch (error) {
      console.error('Error fetching featured projects:', error)
      set({ error: 'Failed to fetch featured projects' })
    }
  },

  refreshOnCategoryUpdate: () => {
    // Clear category cache to force refresh
    categoryIdToSlugMap.clear();
    categoryMapLastFetch = 0;
    
    // Refresh projects data
    const store = get();
    if (store.projects.length > 0) {
      store.fetchProjects();
    }
    if (store.featuredProjects.length > 0) {
      store.fetchFeaturedProjects();
    }
  }
}))

// Set up category update listener
if (typeof window !== 'undefined') {
  window.addEventListener('categories:updated', () => {
    const store = usePortfolioStore.getState();
    store.refreshOnCategoryUpdate();
  });
}

// Compatibility exports to avoid runtime errors from legacy imports
export const PORTFOLIO_UPDATE_EVENT = 'portfolio:update'

export const portfolioStore = {
  subscribe: (callback: () => void) => {
    const handler = () => callback()
    window.addEventListener(PORTFOLIO_UPDATE_EVENT, handler)
    return () => window.removeEventListener(PORTFOLIO_UPDATE_EVENT, handler)
  },
  emitUpdate: () => {
    try {
      window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATE_EVENT))
    } catch (e) {
      console.warn('Failed to dispatch portfolio update event', e)
    }
  },
}
