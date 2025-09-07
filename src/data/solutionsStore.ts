import { SolutionsConfig, SolutionCard, DEFAULT_SOLUTIONS_CONFIG } from '@/types/solutions';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'aiMaster:solutions';
const SUPABASE_KEY = 'solutions_v1';

class SolutionsStore {
  private isSSR(): boolean {
    return typeof window === 'undefined';
  }

  private validateConfig(config: any): config is SolutionsConfig {
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

  private fixOrder(items: SolutionCard[]): SolutionCard[] {
    return items
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({ ...item, order: index }));
  }

  private ensureUniqueIds(items: SolutionCard[]): SolutionCard[] {
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

  getConfig(): SolutionsConfig | null {
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

  saveConfig(config: SolutionsConfig): boolean {
    if (this.isSSR()) return false;

    const fixedItems = this.ensureUniqueIds(this.fixOrder(config.items));
    const configToSave = {
      ...config,
      items: fixedItems,
      updatedAt: new Date().toISOString()
    };

    // Pre-flight size guard: localStorage is typically ~5MB. Keep some headroom.
    try {
      const json = JSON.stringify(configToSave);
      if (json.length > 4_500_000) {
        console.error('Solutions config too large for localStorage. Size (bytes):', json.length);
        try { window.dispatchEvent(new Event('solutions:save_failed')); } catch {}
        return false;
      }
      localStorage.setItem(STORAGE_KEY, json);
      try { window.dispatchEvent(new Event('solutions:updated')); } catch {}
      return true;
    } catch (error) {
      console.error('Failed to save solutions config:', error);
      try { window.dispatchEvent(new Event('solutions:save_failed')); } catch {}
      return false;
    }
  }

  // -------- Supabase integration (non-breaking, optional) --------
  private isSupabaseReady(): boolean {
    return typeof supabase !== 'undefined' && supabase !== null;
  }

  private normalize(config: SolutionsConfig): SolutionsConfig {
    const fixedItems = this.ensureUniqueIds(this.fixOrder(config.items));
    return { ...config, items: fixedItems };
  }

  async fetchFromSupabase(): Promise<SolutionsConfig | null> {
    if (!this.isSupabaseReady()) return null;
    try {
      const { data, error } = await (supabase as any)
        .from('site_configs')
        .select('content, updated_at')
        .eq('key', SUPABASE_KEY)
        .maybeSingle();
      if (error) {
        console.warn('Supabase solutions fetch error:', error.message);
        return null;
      }
      if (!data?.content) return null;
      const cfg = data.content as SolutionsConfig;
      if (!this.validateConfig(cfg)) return null;
      const normalized = this.normalize(cfg);
      // Sync to local for faster next loads
      try { this.saveConfig({ ...normalized, updatedAt: new Date().toISOString() }); } catch {}
      return normalized;
    } catch (e) {
      console.warn('Supabase solutions fetch exception:', e);
      return null;
    }
  }

  async saveToSupabase(config: SolutionsConfig): Promise<boolean> {
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
        console.error('Supabase solutions save error:', error.message);
        return false;
      }
      try { window.dispatchEvent(new Event('solutions:updated')); } catch {}
      return true;
    } catch (e) {
      console.error('Supabase solutions save exception:', e);
      return false;
    }
  }

  safeGetConfigOrDefaults(): SolutionsConfig {
    const stored = this.getConfig();
    return stored || DEFAULT_SOLUTIONS_CONFIG;
  }

  resetToDefaults(): void {
    if (this.isSSR()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset solutions config:', error);
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

export const solutionsStore = new SolutionsStore();