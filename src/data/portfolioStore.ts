import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'

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
}

// Helper function to determine size based on index or random assignment
const getRandomSize = (): 'small' | 'medium' | 'large' => {
  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

// Helper function to map category IDs to category names
const getCategoryFromIds = (categoryIds: string[]): string => {
  // Default to 'restaurants' if no categories, or use first category
  return categoryIds.length > 0 ? 'restaurants' : 'restaurants';
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
      const transformedProjects: Project[] = (data || []).map(dbProject => ({
        id: dbProject.id,
        businessName: dbProject.title,
        businessType: 'מסעדה', // Default business type
        serviceType: 'תמונות' as const,
        imageAfter: dbProject.image_after_url,
        imageBefore: dbProject.image_before_url || undefined,
        size: getRandomSize(),
        category: getCategoryFromIds(dbProject.category_ids || []),
        tags: dbProject.category_ids || [],
        createdAt: dbProject.created_at
      }));
      
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
      const transformedProjects: Project[] = (data || []).map(dbProject => ({
        id: dbProject.id,
        businessName: dbProject.title,
        businessType: 'מסעדה',
        serviceType: 'תמונות' as const,
        imageAfter: dbProject.image_after_url,
        imageBefore: dbProject.image_before_url || undefined,
        size: getRandomSize(),
        category: getCategoryFromIds(dbProject.category_ids || []),
        tags: dbProject.category_ids || [],
        createdAt: dbProject.created_at
      }));
      
      set({ featuredProjects: transformedProjects })
    } catch (error) {
      console.error('Error fetching featured projects:', error)
      set({ error: 'Failed to fetch featured projects' })
    }
  }
}))

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
