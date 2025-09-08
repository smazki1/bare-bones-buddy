import { Project, categoryFilters } from './portfolioMock';
import { supabase } from '@/integrations/supabase/client';
import { callPortfolioAdmin } from '@/lib/supabase-projects';
import { syncProjectTags } from '@/utils/tagUtils';

// Event for real-time updates between admin and frontend
export const PORTFOLIO_UPDATE_EVENT = 'portfolioConfigUpdate';

export interface PortfolioConfig {
  items: Project[];
  updatedAt?: string;
  initialized?: boolean;
  manualOrderByCategory?: Record<string, string[]>; // Changed to string[]
}

// Normalize and validate project size
const normalizeSize = (s: any): 'small' | 'medium' | 'large' => {
  if (s === 'small' || s === 'medium' || s === 'large') return s;
  const lower = typeof s === 'string' ? s.toLowerCase().trim() : '';
  if (lower === 'small' || lower === 'medium' || lower === 'large') return lower as any;
  return 'medium';
};

// Convert Supabase project to frontend format
const convertFromSupabase = (dbProject: any): Project => {
  console.log('🔄 Converting from Supabase:', {
    id: dbProject.id,
    business_name: dbProject.business_name,
    hasImageAfter: !!dbProject.image_after,
    imageAfterLength: dbProject.image_after?.length || 0
  });
  
  const tags = dbProject.tags || [dbProject.category];
  const syncedTags = syncProjectTags(tags, dbProject.category);
  
  const converted = {
    id: dbProject.id.toString(),
    businessName: dbProject.business_name,
    businessType: dbProject.business_type,
    serviceType: dbProject.service_type,
    imageAfter: dbProject.image_after,
    imageBefore: dbProject.image_before,
    size: normalizeSize(dbProject.size),
    category: dbProject.category,
    tags: syncedTags,
    pinned: dbProject.pinned || false,
    createdAt: dbProject.created_at
  };
  
  console.log('✅ Converted project:', {
    businessName: converted.businessName,
    hasImageAfter: !!converted.imageAfter,
    imageAfterPreview: converted.imageAfter?.substring(0, 50)
  });
  
  return converted;
};

// Convert frontend project to Supabase format for update
const convertToSupabaseUpdate = (project: Project) => {
  const syncedTags = syncProjectTags(project.tags, project.category);
  
  return {
    business_name: project.businessName,
    business_type: project.businessType,
    service_type: project.serviceType,
    image_after: project.imageAfter,
    image_before: project.imageBefore || null,
    size: normalizeSize(project.size),
    category: syncedTags[0] || project.category,
    tags: syncedTags,
    pinned: project.pinned || false,
  };
};

class PortfolioStore {
  private config: PortfolioConfig = { items: [], initialized: false };
  private isLoaded = false;
  private realtimeChannel: any = null;
  private isMutating = false;
  private readonly STORAGE_KEY = 'portfolioConfig_v2';

  constructor() {
    this.loadConfig();
    this.setupRealtimeSubscription();
  }

  private loadFromLocalStorage(): PortfolioConfig | null {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      // Validate the stored data
      if (parsed && Array.isArray(parsed.items) && typeof parsed.initialized === 'boolean') {
        return parsed;
      }
      return null;
    } catch (error) {
      console.warn('Error loading from localStorage:', error);
      return null;
    }
  }

  private saveToLocalStorage(config: PortfolioConfig): void {
    try {
      if (typeof window === 'undefined') return;
      // Store full URLs to allow instant display on next load
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
      // If still failing, clear old data and try with just basic info
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        const basicConfig = {
          initialized: config.initialized,
          items: config.items.map(item => ({
            id: item.id,
            businessName: item.businessName,
            category: item.category || item.businessType,
            tags: item.tags || [],
            hasImageAfter: !!item.imageAfter,
            hasImageBefore: !!item.imageBefore
          }))
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(basicConfig));
      } catch (secondError) {
        console.warn('Failed to save even basic config:', secondError);
      }
    }
  }

  private getFallbackConfig(): PortfolioConfig {
    // Return empty list to avoid showing mock data
    return {
      items: [],
      initialized: true,
      updatedAt: new Date().toISOString(),
      manualOrderByCategory: {}
    };
  }

  private async loadConfig(): Promise<void> {
    try {
      if (this.isLoaded) return;

      // Try warm start from localStorage for instant UI
      const cached = this.loadFromLocalStorage();
      if (cached && !this.isLoaded) {
        this.config = cached;
        this.isLoaded = true;
        this.dispatchUpdateEvent();
        // Fetch fresh in background without blocking UI
        void this.fetchFromSupabaseFresh();
        return;
      }

      // Clear localStorage if it's corrupted or too large
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored && stored.length > 5000000) { // 5MB limit
          console.log('Clearing large localStorage cache');
          localStorage.removeItem(this.STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      // No cache: fetch fresh (awaited)
      await this.fetchFromSupabaseFresh();
    } catch (error) {
      console.error('Error in loadConfig:', error);
      // Final fallback
      if (!this.isLoaded) {
        this.config = this.getFallbackConfig();
        this.isLoaded = true;
        this.dispatchUpdateEvent();
      }
    }
  }

  private async fetchFromSupabaseFresh(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(50)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (!error && projects && projects.length > 0) {
        const map = new Map<string, any>();
        for (const p of projects) {
          const key = String(p.id);
          if (!map.has(key)) map.set(key, p);
        }
        const deduped = Array.from(map.values());
        this.config = {
          items: deduped.map(convertFromSupabase),
          initialized: true,
          updatedAt: new Date().toISOString(),
          manualOrderByCategory: {}
        };
        this.saveToLocalStorage(this.config);
        this.isLoaded = true;
        this.dispatchUpdateEvent();
      } else if (error) {
        console.warn('Supabase error while fetching fresh:', error);
        if (!this.isLoaded) {
          this.config = this.getFallbackConfig();
          this.isLoaded = true;
          this.dispatchUpdateEvent();
        }
      }
    } catch (e) {
      console.warn('Fetch fresh failed:', e);
      if (!this.isLoaded) {
        this.config = this.getFallbackConfig();
        this.isLoaded = true;
        this.dispatchUpdateEvent();
      }
    }
  }

  private async saveProjectToSupabase(project: Project, mode: 'add' | 'update'): Promise<boolean> {
    try {
      console.log('Attempting to save project to Supabase:', { 
        mode, 
        projectId: project.id, 
        businessName: project.businessName,
        size: project.size,
        tags: project.tags 
      });

      if (mode === 'add') {
        // Insert without overriding identity columns
          const insertPayload = {
            business_name: project.businessName,
            business_type: project.businessType,
            service_type: project.serviceType,
            image_after: project.imageAfter,
            image_before: project.imageBefore || null,
            size: normalizeSize(project.size),
            category: project.tags?.[0] || project.category,
            tags: project.tags || [project.category],
            pinned: project.pinned || false,
          };

        console.log('Insert payload:', insertPayload);

        const { data, error } = await (supabase as any)
          .from('projects')
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          console.error('Direct insert failed:', error.message, error.details);
          console.warn('Attempting Edge Function fallback...');
          try {
            const res = await callPortfolioAdmin('add', insertPayload);
            console.log('Edge function response:', res);
            if (res?.id) {
              project.id = res.id.toString();
              project.createdAt = res.created_at;
              return true;
            }
            console.error('Edge function result invalid:', res);
            return false;
          } catch (edgeError) {
            console.error('Edge function failed:', edgeError);
            return false;
          }
        } else {
          // Success: Update project ID from DB
          if (data?.id) {
            project.id = data.id.toString();
            project.createdAt = data.created_at;
          }
          console.log('Project added successfully:', project.id);
          return true;
        }
      } else {
        // Update existing project
        const updatePayload = convertToSupabaseUpdate(project);
        console.log('Update payload:', updatePayload);

        const { error } = await (supabase as any)
          .from('projects')
          .update(updatePayload)
          .eq('id', project.id);

        if (error) {
          console.error('Direct update failed:', error.message, error.details);
          console.warn('Attempting Edge Function fallback...');
          try {
            const res = await callPortfolioAdmin('update', { id: project.id, ...updatePayload });
            if (!res || res.error) {
              console.error('Edge function update failed:', res);
              return false;
            }
            console.log('Edge function update success:', res);
            return true;
          } catch (edgeError) {
            console.error('Edge function update failed:', edgeError);
            return false;
          }
        }
        console.log('Project updated successfully:', project.id);
        return true;
      }
    } catch (error) {
      console.error('Error saving project to Supabase:', error);
      // Show error message
      window.dispatchEvent(new CustomEvent('showToast', { detail: { type: 'error', message: error.message || 'שגיאה בשמירת הפרויקט' } }));
      return false;
    }
  }

  private async deleteProjectFromSupabase(id: string | number): Promise<boolean> {
    try {
      const res = await callPortfolioAdmin('delete', { id: String(id) });
      if (!res || res.deleted !== true) {
        console.error('Edge function delete returned unexpected payload:', res);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }
  }

  private setupRealtimeSubscription(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Subscribe to real-time changes on projects table
      this.realtimeChannel = supabase
        .channel('portfolio-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects'
          },
          async (payload) => {
            console.log('Realtime update received:', payload);
            try {
              // Just reload the entire config when any change happens
              this.isLoaded = false; // Force reload
              await this.loadConfig();
            } catch (error) {
              console.error('Error handling realtime update:', error);
            }
          }
        )
        .subscribe();

      console.log('Portfolio realtime subscription started');
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }

  dispatchUpdateEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATE_EVENT, { 
        detail: { items: this.config.items, timestamp: Date.now() } 
      }));
    }
  }

  async getProjects(): Promise<Project[]> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return [...this.config.items];
  }

  async getConfig(): Promise<PortfolioConfig> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return { ...this.config };
  }

  async reload(): Promise<void> {
    // Force a fresh fetch from Supabase (avoid cached state)
    this.isLoaded = false;
    await this.loadConfig();
  }

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    if (this.isMutating) {
      console.warn('Mutation in progress. Ignoring addProject call.');
      throw new Error('מוטציה בתהליך, נסה שוב');
    }
    this.isMutating = true;
    if (!this.isLoaded) {
      await this.loadConfig();
    }

    try {
      const newProject: Project = {
        ...project,
        id: Date.now().toString(), // Temporary ID
        createdAt: new Date().toISOString()
      };

      // Optimistic update - add to local config immediately
      this.config.items.unshift(newProject);
      this.saveToLocalStorage(this.config); // Cache immediately
      this.dispatchUpdateEvent();

      const success = await this.saveProjectToSupabase(newProject, 'add');
      if (!success) {
        // Revert optimistic update if save failed
        this.config.items = this.config.items.filter(p => p.id !== newProject.id);
        this.saveToLocalStorage(this.config);
        this.dispatchUpdateEvent();
        throw new Error('שגיאה בשמירת הפרויקט. בדוק הרשאות אדמין.');
      }
      
      // Force sync from DB to get the real ID and ensure server truth wins
      await this.reload();
      return newProject;
    } catch (error) {
      console.error('Error in addProject:', error);
      // Show error message
      window.dispatchEvent(new CustomEvent('showToast', { detail: { type: 'error', message: error.message || 'שגיאה בשמירת הפרויקט' } }));
      throw error;
    } finally {
      this.isMutating = false;
    }
  }

  async updateProject(id: string | number, updates: Partial<Project>): Promise<boolean> {
    if (this.isMutating) {
      console.warn('Mutation in progress. Ignoring updateProject call.');
      return false;
    }
    this.isMutating = true;
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    
    const index = this.config.items.findIndex(p => p.id == id);
    if (index === -1) {
      console.error('Project not found for update:', id);
      return false;
    }

    const originalProject = { ...this.config.items[index] };
    const updatedProject = { 
      ...this.config.items[index], 
      ...updates,
      id: this.config.items[index].id // Preserve original ID
    };
    
    // Apply optimistic update
    this.config.items[index] = updatedProject;
    this.saveToLocalStorage(this.config); // Cache immediately
    this.dispatchUpdateEvent();

    try {
      const success = await this.saveProjectToSupabase(updatedProject, 'update');
      if (!success) {
        // Revert optimistic update if save failed
        this.config.items[index] = originalProject;
        this.saveToLocalStorage(this.config);
        this.dispatchUpdateEvent();
        // Show error message
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { type: 'error', message: 'שגיאה בעדכון הפרויקט' } 
        }));
        return false;
      }
      // Show success message
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { type: 'success', message: 'הפרויקט עודכן בהצלחה!' } 
      }));
      // Force sync from DB to ensure server truth wins
      await this.reload();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      // Revert optimistic update if save failed
      this.config.items[index] = originalProject;
      this.saveToLocalStorage(this.config);
      this.dispatchUpdateEvent();
      // Show error message
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { type: 'error', message: 'שגיאה בעדכון הפרויקט' } 
      }));
      return false;
    } finally {
      this.isMutating = false;
    }
  }

  async deleteProject(id: string | number): Promise<boolean> {
    if (this.isMutating) {
      console.warn('Mutation in progress. Ignoring deleteProject call.');
      return false;
    }
    this.isMutating = true;
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    try {
      const success = await this.deleteProjectFromSupabase(id);
      if (!success) return false;
      // Hard reload from DB to prevent ghost items
      await this.reload();
      return true;
    } finally {
      this.isMutating = false;
    }
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    const projects = await this.getProjects();
    if (category === 'all') {
      return projects;
    }
    // Filter projects that have the category in their tags or as their primary category
    const filtered = projects.filter(p => p.tags?.includes(category) || p.category === category);
    console.log(`Filtered ${filtered.length} projects for category: ${category}`);
    return filtered;
  }

  async saveProjectsBatch(projects: Project[]): Promise<boolean> {
    if (this.isMutating) {
      console.warn('Mutation in progress. Ignoring saveProjectsBatch call.');
      return false;
    }
    this.isMutating = true;
    try {
      // Update local config with batch
      this.config.items = projects;
      this.config.updatedAt = new Date().toISOString();
      this.saveToLocalStorage(this.config);
      this.dispatchUpdateEvent();
      
      // Note: Individual saves to Supabase happen through add/update/delete methods
      return true;
    } finally {
      this.isMutating = false;
    }
  }

  async pinProject(id: string, pinned: boolean = true): Promise<boolean> {
    return this.updateProject(id, { pinned });
  }

  getAvailableCategories(): typeof categoryFilters {
    return categoryFilters;
  }

  // Manual ordering methods
  async reorderProjects(category: string, newOrder: string[]): Promise<boolean> {
    try {
      this.config.manualOrderByCategory = {
        ...this.config.manualOrderByCategory,
        [category]: newOrder
      };
      this.saveToLocalStorage(this.config);
      this.dispatchUpdateEvent();
      return true;
    } catch (error) {
      console.error('Error reordering projects:', error);
      return false;
    }
  }

  async setManualOrderForCategory(category: string, projectIds: string[]): Promise<void> {
    try {
      this.config.manualOrderByCategory = {
        ...this.config.manualOrderByCategory,
        [category]: projectIds
      };
      this.saveToLocalStorage(this.config);
      this.dispatchUpdateEvent();
    } catch (error) {
      console.error('Error setting manual order:', error);
    }
  }

  async togglePinned(id: string): Promise<boolean> {
    const project = this.config.items.find(p => p.id === id);
    if (!project) return false;
    return this.updateProject(id, { pinned: !project.pinned });
  }

  getStats() {
    const projects = this.config.items;
    const totalProjects = projects.length;
    const pinnedProjects = projects.filter(p => p.pinned).length;
    const byCategory = projects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byServiceType = projects.reduce((acc, p) => {
      acc[p.serviceType] = (acc[p.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalProjects,
      totalProjects,
      pinnedProjects,
      byCategory,
      byServiceType,
      lastUpdated: this.config.updatedAt || new Date().toISOString()
    };
  }

  async setProjects(projects: Project[]): Promise<void> {
    this.config.items = projects;
    this.config.updatedAt = new Date().toISOString();
    this.saveToLocalStorage(this.config);
    this.dispatchUpdateEvent();
  }

  async exportConfig(): Promise<Blob> {
    const config = await this.getConfig();
    const exportData = {
      ...config,
      exportedAt: new Date().toISOString(),
      version: 'v2'
    };
    return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  }

  async importConfig(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      if (!importedData.items || !Array.isArray(importedData.items)) {
        throw new Error('קובץ לא תקין');
      }

      this.config = {
        items: importedData.items,
        initialized: true,
        updatedAt: new Date().toISOString(),
        manualOrderByCategory: importedData.manualOrderByCategory || {}
      };
      
      this.saveToLocalStorage(this.config);
      this.dispatchUpdateEvent();
      return true;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }

  async reset(): Promise<void> {
    this.config = {
      items: [],
      initialized: true,
      updatedAt: new Date().toISOString(),
      manualOrderByCategory: {}
    };
    this.saveToLocalStorage(this.config);
    this.dispatchUpdateEvent();
  }

  cleanup(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
}

export const portfolioStore = new PortfolioStore();