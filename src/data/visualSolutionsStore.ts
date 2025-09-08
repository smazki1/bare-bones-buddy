import { VisualSolutionsConfig, VisualSolutionCard, DEFAULT_VISUAL_SOLUTIONS_CONFIG } from '@/types/visualSolutions';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'aiMaster:visualSolutions';
const SUPABASE_KEY = 'visual_solutions_v1';

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
      // Try to save with size limit check
      const configStr = JSON.stringify(configToSave);
      if (configStr.length > 5000000) { // 5MB limit
        console.warn('Visual solutions config too large, truncating...');
        const truncatedConfig = {
          ...configToSave,
          items: configToSave.items.slice(0, 50) // Keep only first 50 items
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(truncatedConfig));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      }
      
      console.log('Visual solutions config saved successfully');
      
      // Notify same-tab listeners with a small delay to ensure storage is written
      setTimeout(() => {
        try {
          const updateEvent = new CustomEvent('visualSolutions:updated', { 
            detail: configToSave 
          });
          window.dispatchEvent(updateEvent);
          console.log('Visual solutions update event dispatched');
          
          // Also trigger storage event manually for same-tab updates
          const storageEvent = new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: JSON.stringify(configToSave),
            storageArea: localStorage
          });
          window.dispatchEvent(storageEvent);
          console.log('Storage event dispatched manually');
        } catch (error) {
          console.error('Failed to dispatch update event:', error);
        }
      }, 10);
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

  // ---------- Supabase integration (optional but preferred) ----------
  private isSupabaseReady(): boolean {
    return typeof supabase !== 'undefined' && supabase !== null;
  }

  private normalize(config: VisualSolutionsConfig): VisualSolutionsConfig {
    const fixedItems = this.ensureUniqueIds(this.fixOrder(config.items));
    return { ...config, items: fixedItems };
  }

  async fetchFromSupabase(): Promise<VisualSolutionsConfig | null> {
    if (!this.isSupabaseReady()) return null;
    try {
      const { data, error } = await (supabase as any)
        .from('site_configs')
        .select('content, updated_at')
        .eq('key', SUPABASE_KEY)
        .maybeSingle();
      if (error) {
        console.warn('Supabase visual solutions fetch error:', error.message);
        return null;
      }
      if (!data?.content) return null;
      const cfg = data.content as VisualSolutionsConfig;
      if (!this.validateConfig(cfg)) return null;
      const normalized = this.normalize(cfg);
      try { this.saveConfig({ ...normalized, updatedAt: new Date().toISOString() } as any); } catch {}
      return normalized;
    } catch (e) {
      console.warn('Supabase visual solutions fetch exception:', e);
      return null;
    }
  }

  async saveToSupabase(config: VisualSolutionsConfig): Promise<boolean> {
    if (!this.isSupabaseReady()) return false;
    try {
      const normalized = this.normalize(config);
      const payload = {
        key: SUPABASE_KEY,
        content: normalized,
        updated_at: new Date().toISOString()
      };
      const { error } = await (supabase as any)
        .from('site_configs')
        .upsert(payload, { onConflict: 'key' });
      if (error) {
        console.error('Supabase visual solutions save error:', error.message);
        return false;
      }
      try { window.dispatchEvent(new Event('visualSolutions:updated')); } catch {}
      return true;
    } catch (e) {
      console.error('Supabase visual solutions save exception:', e);
      return false;
    }
  }
}

export const visualSolutionsStore = new VisualSolutionsStore();