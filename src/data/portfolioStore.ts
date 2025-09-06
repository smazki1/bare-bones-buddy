import { Project, categoryFilters, fullPortfolioData } from './portfolioMock';
import { supabase } from '@/integrations/supabase/client';
import { callPortfolioAdmin } from '@/lib/supabase-projects';

// Event for real-time updates between admin and frontend
export const PORTFOLIO_UPDATE_EVENT = 'portfolioConfigUpdate';

export interface PortfolioConfig {
  items: Project[];
  updatedAt?: string;
  initialized?: boolean;
  manualOrderByCategory?: Record<string, number[]>;
}

// Convert Supabase project to frontend format
const convertFromSupabase = (dbProject: any): Project => ({
  id: dbProject.id.toString(),
  businessName: dbProject.business_name,
  businessType: dbProject.business_type,
  serviceType: dbProject.service_type,
  imageAfter: dbProject.image_after,
  imageBefore: dbProject.image_before,
  size: dbProject.size,
  category: dbProject.category,
  pinned: dbProject.pinned || false,
  createdAt: dbProject.created_at
});

// Convert frontend project to Supabase format for update
const convertToSupabaseUpdate = (project: Project) => ({
  business_name: project.businessName,
  business_type: project.businessType,
  service_type: project.serviceType,
  image_after: project.imageAfter,
  image_before: project.imageBefore,
  size: project.size,
  category: project.category,
  pinned: project.pinned || false,
  created_at: project.createdAt
});

// Convert frontend project to Supabase format for insert  
const convertToSupabaseInsert = (project: Project) => ({
  id: Number(project.id),
  business_name: project.businessName,
  business_type: project.businessType,
  service_type: project.serviceType,
  image_after: project.imageAfter,
  image_before: project.imageBefore,
  size: project.size,
  category: project.category,
  pinned: project.pinned || false,
  created_at: project.createdAt
});

class PortfolioStore {
  private config: PortfolioConfig = { items: [], initialized: false };
  private isLoaded = false;

  constructor() {
    this.loadConfig();
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
          items: fullPortfolioData,
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
          this.config = {
            items: projects.map(convertFromSupabase),
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
      // Fallback to mock data
      this.config = {
        items: fullPortfolioData,
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
      // First try direct DB write (works when admin session passes RLS)
      const supabaseProject = convertToSupabaseInsert(project);
      const { data, error } = await (supabase as any)
        .from('projects')
        .upsert(supabaseProject, { onConflict: 'id' })
        .select()
        .single();

      if (!error) {
        if (data?.id) project.id = data.id.toString();
        return true;
      }

      console.warn('Direct upsert failed, attempting Edge Function fallback:', error?.message || error);

      // Fallback via Edge Function (service role) – requires ADMIN_TOKEN in storage
      const payload = mode === 'add'
        ? {
            id: Number(project.id),
            business_name: project.businessName,
            business_type: project.businessType,
            service_type: project.serviceType,
            image_after: project.imageAfter,
            image_before: project.imageBefore || null,
            size: project.size,
            category: project.category,
            pinned: project.pinned || false,
            created_at: project.createdAt,
          }
        : {
            id: Number(project.id),
            business_name: project.businessName,
            business_type: project.businessType,
            service_type: project.serviceType,
            image_after: project.imageAfter,
            image_before: project.imageBefore || null,
            size: project.size,
            category: project.category,
            pinned: project.pinned || false,
          };

      const res = await callPortfolioAdmin(mode, payload);
      if (res?.id) project.id = res.id.toString();
      return true;
    } catch (error) {
      console.error('Error saving project to Supabase:', error);
      return false;
    }
  }

  private async deleteProjectFromSupabase(id: string | number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', Number(id));
      
      if (!error) return true;

      console.warn('Direct delete failed, attempting Edge Function fallback:', (error as any)?.message || error);
      await callPortfolioAdmin('delete', { id: Number(id) });
      return true;
    } catch (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
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
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    
    // Determine next ID (DB requires explicit id)
    let dbMaxId = 0;
    try {
      const { data: maxRow } = await (supabase as any)
        .from('projects')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      dbMaxId = maxRow?.id ? Number(maxRow.id) : 0;
    } catch {}
    const localMaxId = this.config.items.length > 0 ? Math.max(...this.config.items.map(p => Number(p.id))) : 0;
    const nextId = Math.max(dbMaxId, localMaxId) + 1;

    const newProject: Project = {
      createdAt: new Date().toISOString(),
      pinned: false,
      ...project,
      id: String(nextId)
    };

    const success = await this.saveProjectToSupabase(newProject, 'add');
    if (success) {
      this.config.items.unshift(newProject); // Add to beginning
      this.dispatchUpdateEvent();
      return newProject;
    }

    throw new Error('Failed to save project. Check admin permissions or ADMIN_TOKEN.');
  }

  async updateProject(id: string | number, updates: Partial<Project>): Promise<boolean> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    
    const index = this.config.items.findIndex(p => p.id == id);
    if (index === -1) return false;

    const updatedProject = { 
      ...this.config.items[index], 
      ...updates,
      id: this.config.items[index].id // Preserve original ID
    };
    
    const success = await this.saveProjectToSupabase(updatedProject, 'update');
    if (success) {
      this.config.items[index] = updatedProject;
      this.dispatchUpdateEvent();
      return true;
    }
    
    return false;
  }

  async deleteProject(id: string | number): Promise<boolean> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    
    const success = await this.deleteProjectFromSupabase(id);
    if (success) {
      const initialLength = this.config.items.length;
      this.config.items = this.config.items.filter(p => p.id != id);
      
      if (this.config.items.length < initialLength) {
        this.dispatchUpdateEvent();
        return true;
      }
    }
    
    return false;
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    const projects = await this.getProjects();
    if (category === 'all') {
      return projects;
    }
    const filtered = projects.filter(p => p.category === category);
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
  async reload(): Promise<void> {
    this.isLoaded = false;
    await this.loadConfig();
  }
}

export const portfolioStore = new PortfolioStore();
