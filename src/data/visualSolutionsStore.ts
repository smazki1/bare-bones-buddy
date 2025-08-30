import { VisualSolutionsConfig, VisualSolutionCard, DEFAULT_VISUAL_SOLUTIONS_CONFIG } from '@/types/visualSolutions';

const STORAGE_KEY = 'aiMaster:visualSolutions';

class VisualSolutionsStore {
  private isSSR(): boolean {
    return typeof window === 'undefined';
  }

  private validateConfig(config: any): config is VisualSolutionsConfig {
    if (!config || typeof config !== 'object') return false;
    if (typeof config.sectionTitle !== 'string') return false;
    if (typeof config.sectionSubtitle !== 'string') return false;
    if (!Array.isArray(config.items)) return false;
    
    return config.items.every((item: any) => 
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.enabled === 'boolean' &&
      typeof item.order === 'number'
    );
  }

  private fixOrder(items: VisualSolutionCard[]): VisualSolutionCard[] {
    return items
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({ ...item, order: index }));
  }

  private ensureUniqueIds(items: VisualSolutionCard[]): VisualSolutionCard[] {
    const usedIds = new Set<string>();
    return items.map(item => {
      let id = item.id;
      let counter = 1;
      while (usedIds.has(id)) {
        id = `${item.id}-${counter}`;
        counter++;
      }
      usedIds.add(id);
      return { ...item, id };
    });
  }

  getConfig(): VisualSolutionsConfig | null {
    if (this.isSSR()) return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      if (!this.validateConfig(parsed)) return null;
      
      const fixedItems = this.ensureUniqueIds(this.fixOrder(parsed.items));
      return { ...parsed, items: fixedItems };
    } catch {
      return null;
    }
  }

  saveConfig(config: VisualSolutionsConfig): void {
    if (this.isSSR()) return;
    
    const fixedItems = this.ensureUniqueIds(this.fixOrder(config.items));
    const configToSave = {
      ...config,
      items: fixedItems,
      updatedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    } catch (error) {
      console.error('Failed to save visual solutions config:', error);
    }
  }

  safeGetConfigOrDefaults(): VisualSolutionsConfig {
    const stored = this.getConfig();
    return stored || DEFAULT_VISUAL_SOLUTIONS_CONFIG;
  }

  resetToDefaults(): void {
    if (this.isSSR()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset visual solutions config:', error);
    }
  }

  exportConfig(): Blob {
    const config = this.safeGetConfigOrDefaults();
    const json = JSON.stringify(config, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  importConfig(json: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json);
      if (!this.validateConfig(parsed)) {
        return { success: false, error: 'Invalid configuration format' };
      }
      
      this.saveConfig(parsed);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }

  generateId(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    const config = this.safeGetConfigOrDefaults();
    const existingIds = new Set(config.items.map(item => item.id));
    
    let id = base;
    let counter = 1;
    while (existingIds.has(id)) {
      id = `${base}-${counter}`;
      counter++;
    }
    
    return id;
  }
}

export const visualSolutionsStore = new VisualSolutionsStore();