import { MarketsConfig, MarketTag, DEFAULT_MARKETS_CONFIG } from '@/types/markets';

class MarketsStore {
  private readonly STORAGE_KEY = 'food-vision-markets-config';

  getConfig(): MarketsConfig | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return this.validateConfig(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  saveConfig(config: MarketsConfig): void {
    try {
      // Ensure unique IDs and fix order
      const processedConfig: MarketsConfig = {
        ...config,
        items: config.items
          .map((item, index) => ({
            ...item,
            id: item.id || this.generateId(item.label),
            order: item.order ?? index
          }))
          .sort((a, b) => a.order - b.order),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(processedConfig));
      
      // Dispatch update events
      try {
        window.dispatchEvent(new CustomEvent('markets:updated'));
        window.dispatchEvent(new StorageEvent('storage', {
          key: this.STORAGE_KEY,
          newValue: JSON.stringify(processedConfig)
        }));
      } catch (error) {
        console.warn('Failed to dispatch markets update events:', error);
      }
    } catch (error) {
      console.error('Failed to save markets config:', error);
    }
  }

  safeGetConfigOrDefaults(): MarketsConfig {
    return this.getConfig() || DEFAULT_MARKETS_CONFIG;
  }

  resetToDefaults(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  exportConfig(): Blob {
    const config = this.safeGetConfigOrDefaults();
    return new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  }

  importConfig(json: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json);
      if (!this.validateConfig(parsed)) {
        return { success: false, error: 'תצורה לא תקינה' };
      }
      
      this.saveConfig(parsed);
      return { success: true };
    } catch {
      return { success: false, error: 'קובץ JSON לא תקין' };
    }
  }

  generateId(label: string): string {
    const baseId = label
      .toLowerCase()
      .replace(/[\s\u05D0-\u05EA]+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '');

    const config = this.getConfig();
    if (!config) return baseId;

    const existingIds = new Set(config.items.map(item => item.id));
    if (!existingIds.has(baseId)) return baseId;

    let counter = 1;
    while (existingIds.has(`${baseId}-${counter}`)) {
      counter++;
    }
    return `${baseId}-${counter}`;
  }

  private validateConfig(obj: any): obj is MarketsConfig {
    if (!obj || typeof obj !== 'object') return false;
    if (typeof obj.sectionTitle !== 'string') return false;
    if (typeof obj.sectionSubtitle !== 'string') return false;
    if (!Array.isArray(obj.items)) return false;

    return obj.items.every((item: any) => 
      typeof item.id === 'string' &&
      typeof item.label === 'string' &&
      typeof item.slug === 'string' &&
      typeof item.enabled === 'boolean' &&
      typeof item.order === 'number'
    );
  }
}

export const marketsStore = new MarketsStore();