import { Project, categoryFilters } from './portfolioMock';

// Event for real-time updates between admin and frontend
export const PORTFOLIO_UPDATE_EVENT = 'portfolioConfigUpdate';

const STORAGE_KEY = 'aiMaster:portfolioConfig';

export interface PortfolioConfig {
  items: Project[];
  updatedAt?: string;
}

// Default configuration with existing mock data
const DEFAULT_CONFIG: PortfolioConfig = {
  items: [],
  updatedAt: new Date().toISOString()
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

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading portfolio config:', error);
      this.config = DEFAULT_CONFIG;
    }
  }

  private saveConfig(): void {
    try {
      this.config.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
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

  getProjects(): Project[] {
    return [...this.config.items].sort((a, b) => {
      // Sort by ID to maintain consistent order
      return Number(a.id) - Number(b.id);
    });
  }

  addProject(project: Omit<Project, 'id'>): Project {
    // Generate new ID
    const maxId = this.config.items.length > 0 
      ? Math.max(...this.config.items.map(p => Number(p.id))) 
      : 0;
    
    const newProject: Project = {
      ...project,
      id: maxId + 1
    };

    this.config.items.push(newProject);
    this.saveConfig();
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
    this.saveConfig();
    return true;
  }

  deleteProject(id: string | number): boolean {
    const initialLength = this.config.items.length;
    this.config.items = this.config.items.filter(p => p.id != id);
    
    if (this.config.items.length < initialLength) {
      this.saveConfig();
      return true;
    }
    return false;
  }

  getProjectsByCategory(category: string): Project[] {
    if (category === 'all') {
      return this.getProjects();
    }
    return this.getProjects().filter(p => p.category === category);
  }

  // Bulk operations for import/export
  setProjects(projects: Project[]): void {
    this.config.items = [...projects];
    this.saveConfig();
  }

  exportConfig(): PortfolioConfig {
    return this.getConfig();
  }

  importConfig(config: PortfolioConfig): void {
    this.config = { ...config, updatedAt: new Date().toISOString() };
    this.saveConfig();
  }

  // Reset to empty (admin can import mock data if needed)
  reset(): void {
    this.config = { ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() };
    this.saveConfig();
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

export const portfolioStore = new PortfolioStore();