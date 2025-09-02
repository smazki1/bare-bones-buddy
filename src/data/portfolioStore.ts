import { Project, categoryFilters, fullPortfolioData } from './portfolioMock';
import { get, set } from 'idb-keyval';

// Event for real-time updates between admin and frontend
export const PORTFOLIO_UPDATE_EVENT = 'portfolioConfigUpdate';

const STORAGE_KEY = 'aiMaster:portfolioConfig';
const IDB_KEY = 'aiMaster:idb:portfolioConfig:v1';

export interface PortfolioConfig {
  items: Project[];
  updatedAt?: string;
  initialized?: boolean;
  manualOrderByCategory?: Record<string, number[]>;
}

// Default configuration with existing mock data
const DEFAULT_CONFIG: PortfolioConfig = {
  items: fullPortfolioData, // Initialize with existing catalog data
  updatedAt: new Date().toISOString(),
  initialized: true,
  manualOrderByCategory: {}
};

class PortfolioStore {
  private config: PortfolioConfig = DEFAULT_CONFIG;

  constructor() {
    this.loadConfig();
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this.loadConfig();
        this.dispatchUpdateEvent();
      }
    });
  }

  private async loadConfig(): Promise<void> {
    try {
      // Prefer IndexedDB
      const idbConfig = await get<PortfolioConfig>(IDB_KEY);
      if (idbConfig) {
        this.config = idbConfig;
        // Keep localStorage in sync for backward-compat
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = parsedConfig;
        await set(IDB_KEY, this.config);
        
        if (!parsedConfig.initialized && parsedConfig.items.length === 0) {
          this.config.items = fullPortfolioData;
          this.config.initialized = true;
          await this.saveConfig();
        }
      } else {
        this.config = DEFAULT_CONFIG;
        await this.saveConfig();
      }
    } catch (error) {
      console.error('Error loading portfolio config:', error);
      this.config = DEFAULT_CONFIG;
      await this.saveConfig();
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      this.config.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      await set(IDB_KEY, this.config);
      this.dispatchUpdateEvent();
    } catch (error) {
      console.error('Error saving portfolio config:', error);
    }
  }

  private dispatchUpdateEvent(): void {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATE_EVENT));
  }

  getConfig(): PortfolioConfig {
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

  getProjects(): Project[] {
    return [...this.config.items].sort((a, b) => this.sortProjects(a, b));
  }

  addProject(project: Omit<Project, 'id'>): Project {
    // Generate new ID
    const maxId = this.config.items.length > 0 
      ? Math.max(...this.config.items.map(p => Number(p.id))) 
      : 0;
    
    const newProject: Project = {
      createdAt: new Date().toISOString(),
      pinned: false,
      ...project,
      id: maxId + 1
    };

    this.config.items.push(newProject);
    void this.saveConfig();
    return newProject;
  }

  updateProject(id: string | number, updates: Partial<Project>): boolean {
    const index = this.config.items.findIndex(p => p.id == id);
    if (index === -1) return false;

    this.config.items[index] = { 
      ...this.config.items[index], 
      ...updates,
      id: this.config.items[index].id // Preserve original ID
    };
    void this.saveConfig();
    return true;
  }

  deleteProject(id: string | number): boolean {
    const initialLength = this.config.items.length;
    this.config.items = this.config.items.filter(p => p.id != id);
    
    if (this.config.items.length < initialLength) {
      void this.saveConfig();
      return true;
    }
    return false;
  }

  getProjectsByCategory(category: string): Project[] {
    if (category === 'all') {
      return this.getProjects();
    }
    const filtered = this.getProjects().filter(p => p.category === category);
    return filtered.sort((a, b) => this.sortProjects(a, b, category));
  }

  setManualOrderForCategory(category: string, orderedIds: number[]): void {
    const manual = this.config.manualOrderByCategory || {};
    manual[category] = [...orderedIds];
    this.config.manualOrderByCategory = manual;
    this.saveConfig();
  }

  togglePinned(id: string | number): boolean {
    const idx = this.config.items.findIndex(p => p.id == id);
    if (idx === -1) return false;
    const current = this.config.items[idx].pinned === true;
    this.config.items[idx].pinned = !current;
    this.saveConfig();
    return true;
  }

  // Bulk operations for import/export
  setProjects(projects: Project[]): void {
    this.config.items = [...projects];
    void this.saveConfig();
  }

  exportConfig(): PortfolioConfig {
    return this.getConfig();
  }

  importConfig(config: PortfolioConfig): void {
    this.config = { ...config, updatedAt: new Date().toISOString() };
    void this.saveConfig();
  }

  // Reset to empty (admin can import mock data if needed)
  reset(): void {
    this.config = { ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() };
    void this.saveConfig();
  }

  // Get available categories
  getCategories() {
    return categoryFilters;
  }

  // Statistics for admin dashboard
  getStats() {
    const projects = this.getProjects();
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
}

<<<<<<< HEAD
export const portfolioStore = new PortfolioStore();
=======
export const portfolioStore = new PortfolioStore();
>>>>>>> 1cdeba7 (feat(portfolioStore): durable IndexedDB persistence with localStorage fallback to prevent data loss across edits/builds)
