import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'

export interface Project {
  id: string
  title: string
  description: string | null
  image_before_url: string
  image_after_url: string
  image_after_thumb_url: string
  category_ids: string[]
  is_featured: boolean
  order_index: number
  created_at: string
  updated_at: string
}

interface PortfolioStore {
  projects: Project[]
  featuredProjects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  fetchFeaturedProjects: () => Promise<void>
}

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
      
      set({ projects: data || [], loading: false })
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
      
      set({ featuredProjects: data || [] })
    } catch (error) {
      console.error('Error fetching featured projects:', error)
      set({ error: 'Failed to fetch featured projects' })
    }
  }
}))