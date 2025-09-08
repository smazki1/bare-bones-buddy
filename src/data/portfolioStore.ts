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
  manualOrderByCategory?: Record<string, number[]>;
}

// Convert Supabase project to frontend format
const convertFromSupabase = (dbProject: any): Project => {
  const tags = dbProject.tags || [dbProject.category];
  const syncedTags = syncProjectTags(tags, dbProject.category);
  
  return {
    id: dbProject.id.toString(),
    businessName: dbProject.business_name,
    businessType: dbProject.business_type,
    serviceType: dbProject.service_type,
    imageAfter: dbProject.image_after,
    imageBefore: dbProject.image_before,
    size: dbProject.size,
    category: dbProject.category,
    tags: syncedTags,
    pinned: dbProject.pinned || false,
    createdAt: dbProject.created_at
  };
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
    size: project.size,
    category: syncedTags[0] || project.category,
    tags: syncedTags,
    pinned: project.pinned || false,
  };
};

// Convert frontend project to Supabase format for insert  
const convertToSupabaseInsert = (project: Project) => {
  const syncedTags = syncProjectTags(project.tags, project.category);
  
  return {
    id: Number(project.id),
    business_name: project.businessName,
    business_type: project.businessType,
    service_type: project.serviceType,
    image_after: project.imageAfter,
    image_before: project.imageBefore,
    size: project.size,
    category: syncedTags[0] || project.category,
    tags: syncedTags,
    pinned: project.pinned || false,
    created_at: project.createdAt
  };
};

class PortfolioStore {
  private config: PortfolioConfig = { items: [], initialized: false };
  private isLoaded = false;
  private realtimeChannel: any = null;
  private isMutating = false;

  constructor() {
    this.loadConfig();
    this.setupRealtimeSubscription();
  }

  private async loadConfig(): Promise<void> {
    try {
      if (this.isLoaded) return;
      
      // Load projects from Supabase
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (error) {
        console.error('Error loading projects from Supabase:', error);
        // Fallback to mock data if Supabase fails
        this.config = {
          items: [],
          initialized: true,
          updatedAt: new Date().toISOString(),
          manualOrderByCategory: {}
        };
      } else {
        // If DB empty, keep empty list (admin page will seed DB)
        if (!projects || projects.length === 0) {
          this.config = {
            items: [],
            initialized: true,
            updatedAt: new Date().toISOString(),
            manualOrderByCategory: {}
          };
        } else {
          // Deduplicate by id to avoid any accidental duplicates from race conditions
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
        }
      }
      
      this.isLoaded = true;
      this.dispatchUpdateEvent();
    } catch (error) {
      console.error('Error loading portfolio config:', error);
      // Fallback to empty list (never re-seed automatically)
      this.config = {
        items: [],
        initialized: true,
        updatedAt: new Date().toISOString(),
        manualOrderByCategory: {}
      };
      this.isLoaded = true;
      this.dispatchUpdateEvent();
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
          size: project.size,
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
        }

        // Success
        console.log('Insert successful:', data);
        if (data?.id) project.id = data.id.toString();
        if (data?.created_at) project.createdAt = data.created_at;
        return true;
      } else {
        // Update path – never touch identity or created_at
        const updatePayload = convertToSupabaseUpdate(project);
        console.log('Update payload:', updatePayload);
        
        const { data, error } = await (supabase as any)
          .from('projects')
          .update(updatePayload)
          .eq('id', Number(project.id))
          .select()
          .single();

        if (error) {
          console.error('Direct update failed:', error.message, error.details);
          console.warn('Attempting Edge Function fallback...');
          try {
            const res = await callPortfolioAdmin('update', { id: Number(project.id), ...updatePayload });
            console.log('Edge function update response:', res);
            if (res) {
              return true;
            }
            console.error('Edge function update failed:', res);
            return false;
          } catch (edgeError) {
            console.error('Edge function update failed:', edgeError);
            return false;
          }
        }

        console.log('Update successful:', data);
        return true;
      }
    } catch (error) {
      console.error('Error saving project to Supabase:', error);
      return false;
    }
  }

  private async deleteProjectFromSupabase(id: string | number): Promise<boolean> {
    try {
      // Use Edge Function directly to avoid RLS issues
      const res = await callPortfolioAdmin('delete', { id: Number(id) });
      // Success if function returns a boolean true or an object with indicative flags
      if (res === true) return true;
      if (res && typeof res === 'object') {
        if ('id' in res || (res as any).deleted === true || (res as any).ok === true || (res as any).success === true) {
          return true;
        }
      }
      console.error('Edge function delete returned unexpected payload:', res);
      return false;
    } catch (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }
  }

  private setupRealtimeSubscription(): void {
    // Setup Supabase realtime subscription for instant updates
    this.realtimeChannel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Realtime update received:', payload.eventType);
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  private async handleRealtimeUpdate(payload: any): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    try {
      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            const newProject = convertFromSupabase(newRecord);
            // Add to beginning of list if not already exists
            const exists = this.config.items.some(p => p.id === newProject.id);
            if (!exists) {
              this.config.items.unshift(newProject);
              this.dispatchUpdateEvent();
            }
          }
          break;
          
        case 'UPDATE':
          if (newRecord) {
            const updatedProject = convertFromSupabase(newRecord);
            const index = this.config.items.findIndex(p => p.id === updatedProject.id);
            if (index !== -1) {
              this.config.items[index] = updatedProject;
              this.dispatchUpdateEvent();
            }
          }
          break;
          
        case 'DELETE':
          if (oldRecord) {
            const deletedId = oldRecord.id.toString();
            const initialLength = this.config.items.length;
            this.config.items = this.config.items.filter(p => p.id !== deletedId);
            if (this.config.items.length < initialLength) {
              this.dispatchUpdateEvent();
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error handling realtime update:', error);
    }
  }

  private dispatchUpdateEvent(): void {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATE_EVENT));
  }

  async getConfig(): Promise<PortfolioConfig> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return { ...this.config };
  }

  private sortProjects(a: Project, b: Project, category?: string): number {
    const manual = this.config.manualOrderByCategory || {};
    if (category && manual[category]) {
      const order = manual[category];
      const ia = order.indexOf(Number(a.id));
      const ib = order.indexOf(Number(b.id));
      const aIn = ia !== -1; const bIn = ib !== -1;
      if (aIn && bIn) return ia - ib;
      if (aIn) return -1;
      if (bIn) return 1;
    }

    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;

    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    if (tb !== ta) return tb - ta;

    return Number(b.id) - Number(a.id);
  }

  async getProjects(): Promise<Project[]> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return [...this.config.items].sort((a, b) => this.sortProjects(a, b));
  }

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    if (this.isMutating) {
      console.warn('Mutation in progress. Ignoring addProject call.');
      return Promise.reject(new Error('פעולה בתהליך, נסה שוב.'));
    }
    this.isMutating = true;
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    
    console.log('Adding new project:', project);
    
    // Build new project; ID and created_at will be assigned by DB
    const newProject: Project = {
      id: 'temp',
      createdAt: new Date().toISOString(),
      pinned: false,
      ...project,
    };

    // Do not optimistic insert to avoid duplicates with realtime

    try {
      console.log('Saving to Supabase...');
      const success = await this.saveProjectToSupabase(newProject, 'add');
      console.log('Save result:', success);
      
      if (!success) {
        throw new Error('שגיאה בשמירת הפרויקט. בדוק הרשאות אדמין.');
      }
      // Force sync from DB to avoid any client-side drift
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
    this.dispatchUpdateEvent();

    try {
      const success = await this.saveProjectToSupabase(updatedProject, 'update');
      if (!success) {
        // Revert optimistic update if save failed
        this.config.items[index] = originalProject;
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
    const filtered = projects.filter(p => 
      p.tags?.includes(category) || p.category === category
    );
    return filtered.sort((a, b) => this.sortProjects(a, b, category));
  }

  setManualOrderForCategory(category: string, orderedIds: number[]): void {
    const manual = this.config.manualOrderByCategory || {};
    manual[category] = [...orderedIds];
    this.config.manualOrderByCategory = manual;
    this.dispatchUpdateEvent();
  }

  async togglePinned(id: string | number): Promise<boolean> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    
    const idx = this.config.items.findIndex(p => p.id == id);
    if (idx === -1) return false;
    
    const current = this.config.items[idx].pinned === true;
    const updates = { pinned: !current };
    
    return await this.updateProject(id, updates);
  }

  // Bulk operations for import/export
  async setProjects(projects: Project[]): Promise<void> {
    // For bulk operations, we'll keep the local approach for now
    // This is mainly used for import/export which should be rare
    this.config.items = [...projects];
    this.dispatchUpdateEvent();
  }

  getConfigSync(): PortfolioConfig {
    return { ...this.config };
  }

  exportConfig(): PortfolioConfig {
    return this.getConfigSync();
  }

  importConfig(config: PortfolioConfig): void {
    this.config = { ...config, updatedAt: new Date().toISOString() };
    this.dispatchUpdateEvent();
  }

  // Reset to empty (admin can import mock data if needed)
  reset(): void {
    this.config = { items: [], initialized: true, updatedAt: new Date().toISOString(), manualOrderByCategory: {} };
    this.dispatchUpdateEvent();
  }

  // Get available categories
  getCategories() {
    return categoryFilters;
  }

  // Statistics for admin dashboard
  async getStats() {
    const projects = await this.getProjects();
    const byCategory = categoryFilters.reduce((acc, cat) => {
      if (cat.slug === 'all') return acc;
      acc[cat.slug] = projects.filter(p => p.category === cat.slug).length;
      return acc;
    }, {} as Record<string, number>);

    const byServiceType = projects.reduce((acc, project) => {
      acc[project.serviceType] = (acc[project.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: projects.length,
      byCategory,
      byServiceType,
      lastUpdated: this.config.updatedAt
    };
  }

  // Force reload from Supabase
  // Cleanup realtime subscription
  cleanup(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  async reload(): Promise<void> {
    this.isLoaded = false;
    await this.loadConfig();
  }
}

export const portfolioStore = new PortfolioStore();
