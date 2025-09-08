import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { portfolioStore } from '../portfolioStore';
import type { Project } from '../portfolioMock';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: [], error: null })),
        eq: vi.fn(() => ({ data: [], error: null })),
        maybeSingle: vi.fn(() => ({ data: null, error: null })),
      })),
      insert: vi.fn(() => ({ data: [], error: null })),
      update: vi.fn(() => ({ 
        eq: vi.fn(() => ({ data: [], error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ data: [], error: null })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => ({ data: null, error: null })),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/utils/tagUtils', () => ({
  syncProjectTags: vi.fn((tags) => tags || ['restaurants']),
}));

describe('PortfolioStore', () => {
  const mockProject: Project = {
    id: 1,
    businessName: 'Test Business',
    businessType: 'Test Type',
    serviceType: 'תמונות',
    imageAfter: 'after.jpg',
    imageBefore: 'before.jpg',
    size: 'medium',
    category: 'restaurants',
    tags: ['restaurants', 'bakeries'],
    pinned: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    portfolioStore.reset();
  });

  afterEach(() => {
    portfolioStore.cleanup();
  });

  describe('Data Conversion', () => {
    it('should convert from Supabase format correctly', () => {
      const dbProject = {
        id: 1,
        business_name: 'Test Business',
        business_type: 'Test Type',
        service_type: 'תמונות',
        image_after: 'after.jpg',
        image_before: 'before.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants', 'bakeries'],
        pinned: false,
        created_at: '2023-01-01T00:00:00Z',
      };

      // Access private method for testing
      const convertFromSupabase = (portfolioStore as any).convertFromSupabase;
      const result = convertFromSupabase(dbProject);

      expect(result).toEqual({
        id: 1,
        businessName: 'Test Business',
        businessType: 'Test Type',
        serviceType: 'תמונות',
        imageAfter: 'after.jpg',
        imageBefore: 'before.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants', 'bakeries'],
        pinned: false,
        createdAt: '2023-01-01T00:00:00Z',
      });
    });

    it('should convert to Supabase update format correctly', () => {
      const convertToSupabaseUpdate = (portfolioStore as any).convertToSupabaseUpdate;
      const result = convertToSupabaseUpdate(mockProject);

      expect(result).toEqual({
        business_name: 'Test Business',
        business_type: 'Test Type',
        service_type: 'תמונות',
        image_after: 'after.jpg',
        image_before: 'before.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants', 'bakeries'],
        pinned: false,
      });
    });

    it('should convert to Supabase insert format correctly', () => {
      const convertToSupabaseInsert = (portfolioStore as any).convertToSupabaseInsert;
      const result = convertToSupabaseInsert(mockProject);

      expect(result).toEqual({
        business_name: 'Test Business',
        business_type: 'Test Type',
        service_type: 'תמונות',
        image_after: 'after.jpg',
        image_before: 'before.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants', 'bakeries'],
        pinned: false,
      });
    });

    it('should sync tags during conversion from Supabase', () => {
      const { syncProjectTags } = require('@/utils/tagUtils');
      syncProjectTags.mockReturnValue(['restaurants']);

      const dbProject = {
        id: 1,
        business_name: 'Test',
        business_type: 'Test',
        service_type: 'תמונות',
        image_after: 'after.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants', 'invalid-tag'],
        pinned: false,
      };

      const convertFromSupabase = (portfolioStore as any).convertFromSupabase;
      const result = convertFromSupabase(dbProject);

      expect(syncProjectTags).toHaveBeenCalledWith(['restaurants', 'invalid-tag'], 'restaurants');
      expect(result.tags).toEqual(['restaurants']);
    });

    it('should sync tags during conversion to Supabase', () => {
      const { syncProjectTags } = require('@/utils/tagUtils');
      syncProjectTags.mockReturnValue(['restaurants']);

      const project = {
        ...mockProject,
        tags: ['restaurants', 'invalid-tag'],
      };

      const convertToSupabaseUpdate = (portfolioStore as any).convertToSupabaseUpdate;
      const result = convertToSupabaseUpdate(project);

      expect(syncProjectTags).toHaveBeenCalledWith(['restaurants', 'invalid-tag'], 'restaurants');
      expect(result.tags).toEqual(['restaurants']);
    });
  });

  describe('Project Management', () => {
    it('should add project successfully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: { ok: true, data: { ...mockProject, id: 2 } },
        error: null,
      });

      const newProject = { ...mockProject };
      delete (newProject as any).id;

      const result = await portfolioStore.addProject(newProject);

      expect(result).toEqual(expect.objectContaining({
        id: 2,
        businessName: 'Test Business',
      }));
      expect(supabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: expect.objectContaining({
          action: 'add',
          project: expect.any(Object),
        }),
      });
    });

    it('should update project successfully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: { ok: true },
        error: null,
      });

      const result = await portfolioStore.updateProject(1, {
        businessName: 'Updated Business',
        tags: ['restaurants', 'cafes'],
      });

      expect(result).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: expect.objectContaining({
          action: 'update',
          id: 1,
          project: expect.objectContaining({
            business_name: 'Updated Business',
            tags: ['restaurants', 'cafes'],
          }),
        }),
      });
    });

    it('should delete project successfully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: { ok: true },
        error: null,
      });

      const result = await portfolioStore.deleteProject(1);

      expect(result).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: expect.objectContaining({
          action: 'delete',
          id: 1,
        }),
      });
    });
  });

  describe('Category Filtering', () => {
    beforeEach(async () => {
      // Set up store with test data
      const projects = [
        { ...mockProject, id: 1, tags: ['restaurants'] },
        { ...mockProject, id: 2, tags: ['bakeries'] },
        { ...mockProject, id: 3, tags: ['restaurants', 'bakeries'] },
        { ...mockProject, id: 4, tags: ['cafes'] },
      ];
      await portfolioStore.setProjects(projects);
    });

    it('should filter projects by single category', async () => {
      const result = await portfolioStore.getProjectsByCategory('restaurants');
      
      expect(result).toHaveLength(2);
      expect(result.every(p => p.tags?.includes('restaurants'))).toBe(true);
    });

    it('should return all projects for "all" category', async () => {
      const result = await portfolioStore.getProjectsByCategory('all');
      
      expect(result).toHaveLength(4);
    });

    it('should return empty array for non-existent category', async () => {
      const result = await portfolioStore.getProjectsByCategory('nonexistent');
      
      expect(result).toHaveLength(0);
    });

    it('should handle projects with multiple tags', async () => {
      const result = await portfolioStore.getProjectsByCategory('bakeries');
      
      expect(result).toHaveLength(2);
      expect(result.some(p => p.id === 2)).toBe(true);
      expect(result.some(p => p.id === 3)).toBe(true);
    });
  });

  describe('Manual Ordering', () => {
    it('should set manual order for category', () => {
      portfolioStore.setManualOrderForCategory('restaurants', [3, 1, 2]);

      // Verify the order was set (internal state)
      expect(() => portfolioStore.setManualOrderForCategory('restaurants', [3, 1, 2])).not.toThrow();
    });

    it('should preserve manual order when getting projects by category', async () => {
      const projects = [
        { ...mockProject, id: 1, tags: ['restaurants'] },
        { ...mockProject, id: 2, tags: ['restaurants'] },
        { ...mockProject, id: 3, tags: ['restaurants'] },
      ];
      await portfolioStore.setProjects(projects);
      
      portfolioStore.setManualOrderForCategory('restaurants', [3, 1, 2]);
      
      const result = await portfolioStore.getProjectsByCategory('restaurants');
      
      expect(result.map(p => p.id)).toEqual([3, 1, 2]);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      const projects = [
        { ...mockProject, id: 1, tags: ['restaurants'], serviceType: 'תמונות' as const },
        { ...mockProject, id: 2, tags: ['bakeries'], serviceType: 'סרטונים' as const },
        { ...mockProject, id: 3, tags: ['restaurants'], serviceType: 'תמונות' as const, pinned: true },
      ];
      await portfolioStore.setProjects(projects);
    });

    it('should calculate statistics correctly', async () => {
      const stats = await portfolioStore.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byServiceType).toEqual({
        תמונות: 2,
        סרטונים: 1,
      });
      expect(stats.byCategory.restaurants).toBe(2);
      expect(stats.byCategory.bakeries).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: new Error('Network error'),
      });

      const result = await portfolioStore.updateProject(1, { businessName: 'Updated' });

      expect(result).toBe(false);
    });

    it('should handle edge function errors gracefully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: { ok: false, error: 'Validation failed' },
        error: null,
      });

      const result = await portfolioStore.updateProject(1, { businessName: 'Updated' });

      expect(result).toBe(false);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time INSERT events', async () => {
      const handleRealtimeUpdate = (portfolioStore as any).handleRealtimeUpdate;
      
      const payload = {
        eventType: 'INSERT',
        new: {
          id: 5,
          business_name: 'New Business',
          business_type: 'New Type',
          service_type: 'תמונות',
          image_after: 'new.jpg',
          size: 'small',
          category: 'restaurants',
          tags: ['restaurants'],
          pinned: false,
        },
      };

      handleRealtimeUpdate(payload);

      const projects = await portfolioStore.getProjects();
      expect(projects.some(p => p.id === 5)).toBe(true);
    });

    it('should handle real-time UPDATE events', async () => {
      // Set up initial project
      await portfolioStore.setProjects([mockProject]);

      const handleRealtimeUpdate = (portfolioStore as any).handleRealtimeUpdate;
      
      const payload = {
        eventType: 'UPDATE',
        new: {
          id: 1,
          business_name: 'Updated Business',
          business_type: 'Test Type',
          service_type: 'תמונות',
          image_after: 'after.jpg',
          size: 'medium',
          category: 'restaurants',
          tags: ['restaurants', 'cafes'],
          pinned: true,
        },
      };

      handleRealtimeUpdate(payload);

      const projects = await portfolioStore.getProjects();
      const updatedProject = projects.find(p => p.id === 1);
      expect(updatedProject?.businessName).toBe('Updated Business');
      expect(updatedProject?.tags).toEqual(['restaurants', 'cafes']);
      expect(updatedProject?.pinned).toBe(true);
    });

    it('should handle real-time DELETE events', async () => {
      // Set up initial project
      await portfolioStore.setProjects([mockProject]);

      const handleRealtimeUpdate = (portfolioStore as any).handleRealtimeUpdate;
      
      const payload = {
        eventType: 'DELETE',
        old: { id: 1 },
      };

      handleRealtimeUpdate(payload);

      const projects = await portfolioStore.getProjects();
      expect(projects.some(p => p.id === 1)).toBe(false);
    });
  });
});