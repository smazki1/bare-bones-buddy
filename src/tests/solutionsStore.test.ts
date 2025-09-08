import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { solutionsStore } from '@/data/solutionsStore';
import { SolutionsConfig, DEFAULT_SOLUTIONS_CONFIG } from '@/types/solutions';

// Mock window events
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true
});

describe('solutionsStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockDispatchEvent.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Happy Path Tests', () => {
    it('should save config with normalized order and unique IDs', () => {
      const config: SolutionsConfig = {
        sectionTitle: 'Test Title',
        sectionSubtitle: 'Test Subtitle',
        items: [
          {
            id: 'test-1',
            title: 'Test 1',
            enabled: true,
            order: 5, // Will be normalized to 0
            imageSrc: 'test.jpg',
            tagSlug: 'test'
          },
          {
            id: 'test-2',
            title: 'Test 2', 
            enabled: true,
            order: 2, // Will be normalized to 1
            imageSrc: 'test2.jpg',
            tagSlug: 'test2'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      const result = solutionsStore.saveConfig(config);
      
      expect(result).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'solutions:updated'
      }));
      
      // Verify order was normalized
      const saved = solutionsStore.getConfig();
      expect(saved?.items[0].order).toBe(0);
      expect(saved?.items[1].order).toBe(1);
    });

    it('should return normalized config from getConfig', () => {
      const config = DEFAULT_SOLUTIONS_CONFIG;
      solutionsStore.saveConfig(config);
      
      const result = solutionsStore.getConfig();
      
      expect(result).toBeTruthy();
      expect(result?.sectionTitle).toBe(config.sectionTitle);
      expect(result?.items).toHaveLength(config.items.length);
      expect(result?.items.every((item, index) => item.order === index)).toBe(true);
    });

    it('should handle unique ID generation', () => {
      const config: SolutionsConfig = {
        sectionTitle: 'Test',
        sectionSubtitle: 'Test',
        items: [
          { id: 'test', title: 'Test 1', enabled: true, order: 0 },
          { id: 'test', title: 'Test 2', enabled: true, order: 1 } // Duplicate ID
        ],
        updatedAt: new Date().toISOString()
      };

      solutionsStore.saveConfig(config);
      const saved = solutionsStore.getConfig();
      
      expect(saved?.items[0].id).toBe('test');
      expect(saved?.items[1].id).toBe('test-1'); // Should be made unique
    });

    it('should fire solutions:updated event on successful save', () => {
      const config = DEFAULT_SOLUTIONS_CONFIG;
      
      solutionsStore.saveConfig(config);
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'solutions:updated' })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should return null for invalid JSON in localStorage', () => {
      localStorage.setItem('aiMaster:solutions', 'invalid-json');
      
      const result = solutionsStore.getConfig();
      
      expect(result).toBeNull();
    });

    it('should return null for invalid config structure', () => {
      const invalidConfig = { notAValidConfig: true };
      localStorage.setItem('aiMaster:solutions', JSON.stringify(invalidConfig));
      
      const result = solutionsStore.getConfig();
      
      expect(result).toBeNull();
    });

    it('should handle empty localStorage', () => {
      const result = solutionsStore.getConfig();
      
      expect(result).toBeNull();
    });

    it('should handle large config gracefully', () => {
      const largeConfig: SolutionsConfig = {
        sectionTitle: 'A'.repeat(1000000), // Very large title
        sectionSubtitle: 'Test',
        items: [],
        updatedAt: new Date().toISOString()
      };

      const result = solutionsStore.saveConfig(largeConfig);
      
      expect(result).toBe(false); // Should fail due to size
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'solutions:save_failed' })
      );
    });

    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const result = solutionsStore.saveConfig(DEFAULT_SOLUTIONS_CONFIG);
      
      expect(result).toBe(false);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'solutions:save_failed' })
      );

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Supabase Integration', () => {
    it('should fetch from Supabase and sync to localStorage', async () => {
      const cloudConfig = {
        sectionTitle: 'Cloud Title',
        sectionSubtitle: 'Cloud Subtitle', 
        items: [
          { id: 'cloud-1', title: 'Cloud Item', enabled: true, order: 0 }
        ],
        updatedAt: new Date().toISOString()
      };

      // Mock successful Supabase response
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({
              data: { content: cloudConfig, updated_at: new Date().toISOString() },
              error: null
            }))
          }))
        }))
      } as any);

      const result = await solutionsStore.fetchFromSupabase();
      
      expect(result).toBeTruthy();
      expect(result?.sectionTitle).toBe('Cloud Title');
      expect(result?.items[0].order).toBe(0); // Normalized
    });

    it('should handle Supabase fetch errors gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Network error' }
            }))
          }))
        }))
      } as any);

      const result = await solutionsStore.fetchFromSupabase();
      
      expect(result).toBeNull();
    });

    it('should save to Supabase and fire update event', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      } as any);

      const result = await solutionsStore.saveToSupabase(DEFAULT_SOLUTIONS_CONFIG);
      
      expect(result).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'solutions:updated' })
      );
    });

    it('should handle Supabase save errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({ error: { message: 'Save failed' } }))
      } as any);

      const result = await solutionsStore.saveToSupabase(DEFAULT_SOLUTIONS_CONFIG);
      
      expect(result).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should return defaults when no config exists', () => {
      const result = solutionsStore.safeGetConfigOrDefaults();
      
      expect(result).toEqual(DEFAULT_SOLUTIONS_CONFIG);
    });

    it('should return stored config when it exists', () => {
      const customConfig = {
        ...DEFAULT_SOLUTIONS_CONFIG,
        sectionTitle: 'Custom Title'
      };
      solutionsStore.saveConfig(customConfig);
      
      const result = solutionsStore.safeGetConfigOrDefaults();
      
      expect(result.sectionTitle).toBe('Custom Title');
    });

    it('should reset to defaults', () => {
      solutionsStore.saveConfig({
        ...DEFAULT_SOLUTIONS_CONFIG,
        sectionTitle: 'Custom'
      });
      
      solutionsStore.resetToDefaults();
      const result = solutionsStore.getConfig();
      
      expect(result).toBeNull(); // Should be cleared
    });

    it('should export config as blob', () => {
      const result = solutionsStore.exportConfig();
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/json');
    });

    it('should import valid JSON config', () => {
      const validJson = JSON.stringify(DEFAULT_SOLUTIONS_CONFIG);
      
      const result = solutionsStore.importConfig(validJson);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid JSON config', () => {
      const invalidJson = 'invalid-json';
      
      const result = solutionsStore.importConfig(invalidJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('should reject invalid config structure', () => {
      const invalidConfig = { invalid: 'structure' };
      const invalidJson = JSON.stringify(invalidConfig);
      
      const result = solutionsStore.importConfig(invalidJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid configuration format');
    });

    it('should generate unique IDs', () => {
      // Start with empty config
      solutionsStore.resetToDefaults();
      
      const id1 = solutionsStore.generateId('Test Title');
      const id2 = solutionsStore.generateId('Test Title'); // Same title
      
      expect(id1).toBe('test-title');
      expect(id2).toBe('test-title'); // Should still be unique since no existing items
    });

    it('should generate unique IDs when conflicts exist', () => {
      const configWithItems: SolutionsConfig = {
        sectionTitle: 'Test',
        sectionSubtitle: 'Test',
        items: [
          { id: 'test-title', title: 'Existing', enabled: true, order: 0 }
        ],
        updatedAt: new Date().toISOString()
      };
      solutionsStore.saveConfig(configWithItems);
      
      const newId = solutionsStore.generateId('Test Title');
      
      expect(newId).toBe('test-title-1'); // Should avoid conflict
    });
  });
});