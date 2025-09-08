import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { portfolioStore, PORTFOLIO_UPDATE_EVENT } from '@/data/portfolioStore';
import { Project } from '@/data/portfolioMock';
import { callPortfolioAdmin } from '@/lib/supabase-projects';

// Mock dependencies
vi.mock('@/lib/supabase-projects', () => ({
  callPortfolioAdmin: vi.fn()
}));

vi.mock('@/utils/tagUtils', () => ({
  syncProjectTags: vi.fn((tags, category) => tags || [category])
}));

const mockCallPortfolioAdmin = vi.mocked(callPortfolioAdmin);

// Mock window events
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true
});

describe('portfolioStore', () => {
  const mockProject: Project = {
    id: '1',
    businessName: 'Test Business',
    businessType: 'מסעדה',
    serviceType: 'תמונות',
    imageAfter: 'after.jpg',
    imageBefore: 'before.jpg',
    size: 'medium',
    category: 'restaurants',
    tags: ['restaurants', 'premium'],
    pinned: false,
    createdAt: '2024-01-01T10:00:00Z'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDispatchEvent.mockClear();
    
    // Reset store state
    const store = portfolioStore as any;
    store.config = { items: [], initialized: false };
    store.isLoaded = false;
    store.isMutating = false;

    // Mock successful Supabase responses by default
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [mockProject],
              error: null
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 2, created_at: '2024-01-01T11:00:00Z' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProject,
              error: null
            }))
          }))
        }))
      }))
    } as any);

    mockCallPortfolioAdmin.mockResolvedValue({
      id: 2,
      created_at: '2024-01-01T11:00:00Z'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path - Data Loading and Deduplication', () => {
    it('should fetch projects and deduplicate by ID', async () => {
      const duplicateProject = { ...mockProject, id: '1' }; // Same ID
      
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: [mockProject, duplicateProject], // Duplicates
                error: null
              }))
            }))
          }))
        }))
      } as any);

      const config = await portfolioStore.getConfig();
      
      expect(config.items).toHaveLength(1); // Should deduplicate
      expect(config.initialized).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });

    it('should set initialized true and dispatch event', async () => {
      await portfolioStore.getConfig();
      
      const store = portfolioStore as any;
      expect(store.config.initialized).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });
  });

  describe('Project Management - Add Operations', () => {
    it('should add project without optimistic insert', async () => {
      const newProject = {
        businessName: 'New Business',
        businessType: 'מסעדה',
        serviceType: 'תמונות' as const,
        imageAfter: 'new-after.jpg',
        size: 'large' as const,
        category: 'restaurants'
      };

      const result = await portfolioStore.addProject(newProject);
      
      expect(result).toBeTruthy();
      // Should not add optimistically - waits for DB response
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });

    it('should fallback to callPortfolioAdmin on direct insert failure', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Insert failed', details: 'RLS policy' }
            }))
          }))
        }))
      } as any);

      const newProject = {
        businessName: 'New Business',
        businessType: 'מסעדה',
        serviceType: 'תמונות' as const,
        imageAfter: 'new-after.jpg',
        size: 'large' as const,
        category: 'restaurants'
      };

      await portfolioStore.addProject(newProject);
      
      expect(mockCallPortfolioAdmin).toHaveBeenCalledWith('add', expect.objectContaining({
        business_name: 'New Business'
      }));
    });

    it('should set new ID and created_at from response', async () => {
      mockCallPortfolioAdmin.mockResolvedValue({
        id: 99,
        created_at: '2024-01-01T12:00:00Z'
      });

      const newProject = {
        businessName: 'New Business',
        businessType: 'מסעדה', 
        serviceType: 'תמונות' as const,
        imageAfter: 'new-after.jpg',
        size: 'large' as const,
        category: 'restaurants'
      };

      const result = await portfolioStore.addProject(newProject);
      
      expect(result.id).toBe('99');
      expect(result.createdAt).toBe('2024-01-01T12:00:00Z');
    });

    it('should call reload() after successful add', async () => {
      const reloadSpy = vi.spyOn(portfolioStore as any, 'reload').mockResolvedValue(undefined);

      const newProject = {
        businessName: 'New Business',
        businessType: 'מסעדה',
        serviceType: 'תמונות' as const,
        imageAfter: 'new-after.jpg',
        size: 'large' as const,
        category: 'restaurants'
      };

      await portfolioStore.addProject(newProject);
      
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should release mutation lock in finally block', async () => {
      const store = portfolioStore as any;
      
      const newProject = {
        businessName: 'New Business',
        businessType: 'מסעדה',
        serviceType: 'תמונות' as const,
        imageAfter: 'new-after.jpg',
        size: 'large' as const,
        category: 'restaurants'
      };

      await portfolioStore.addProject(newProject);
      
      expect(store.isMutating).toBe(false);
    });
  });

  describe('Project Management - Update Operations', () => {
    it('should apply optimistic update', async () => {
      // First load data
      await portfolioStore.getConfig();

      const updates = { businessName: 'Updated Business' };
      
      await portfolioStore.updateProject('1', updates);
      
      // Should update optimistically
      const config = await portfolioStore.getConfig();
      const updated = config.items.find(p => p.id === '1');
      expect(updated?.businessName).toBe('Updated Business');
    });

    it('should revert optimistic update on failure', async () => {
      // Load initial data
      await portfolioStore.getConfig();

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: [mockProject],
                error: null
              }))
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Update failed' }
              }))
            }))
          }))
        }))
      } as any);

      const updates = { businessName: 'Updated Business' };
      
      const result = await portfolioStore.updateProject('1', updates);
      
      expect(result).toBe(false);
      // Should revert to original
      const config = await portfolioStore.getConfig();
      const reverted = config.items.find(p => p.id === '1');
      expect(reverted?.businessName).toBe(mockProject.businessName);
    });

    it('should dispatch showToast on success', async () => {
      await portfolioStore.getConfig();

      await portfolioStore.updateProject('1', { businessName: 'Updated' });
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'showToast',
          detail: expect.objectContaining({
            type: 'success',
            message: 'הפרויקט עודכן בהצלחה!'
          })
        })
      );
    });

    it('should call reload() after successful update', async () => {
      const reloadSpy = vi.spyOn(portfolioStore as any, 'reload').mockResolvedValue(undefined);
      await portfolioStore.getConfig();

      await portfolioStore.updateProject('1', { businessName: 'Updated' });
      
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('Project Management - Delete Operations', () => {
    it('should call Edge Function only for delete', async () => {
      await portfolioStore.deleteProject('1');
      
      expect(mockCallPortfolioAdmin).toHaveBeenCalledWith('delete', { id: 1 });
    });

    it('should accept various success payload shapes', async () => {
      // Test boolean true
      mockCallPortfolioAdmin.mockResolvedValueOnce(true);
      let result = await portfolioStore.deleteProject('1');
      expect(result).toBe(true);

      // Test object with id
      mockCallPortfolioAdmin.mockResolvedValueOnce({ id: 1 });
      result = await portfolioStore.deleteProject('1');
      expect(result).toBe(true);

      // Test object with deleted flag
      mockCallPortfolioAdmin.mockResolvedValueOnce({ deleted: true });
      result = await portfolioStore.deleteProject('1');
      expect(result).toBe(true);

      // Test object with ok flag
      mockCallPortfolioAdmin.mockResolvedValueOnce({ ok: true });
      result = await portfolioStore.deleteProject('1');
      expect(result).toBe(true);

      // Test object with success flag
      mockCallPortfolioAdmin.mockResolvedValueOnce({ success: true });
      result = await portfolioStore.deleteProject('1');
      expect(result).toBe(true);
    });

    it('should call reload() after successful delete', async () => {
      const reloadSpy = vi.spyOn(portfolioStore as any, 'reload').mockResolvedValue(undefined);

      await portfolioStore.deleteProject('1');
      
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('Sorting and Filtering', () => {
    it('should sort projects by pinned desc, createdAt desc, id desc', async () => {
      const projects: Project[] = [
        { ...mockProject, id: '1', pinned: false, createdAt: '2024-01-01T10:00:00Z' },
        { ...mockProject, id: '2', pinned: true, createdAt: '2024-01-01T09:00:00Z' },
        { ...mockProject, id: '3', pinned: false, createdAt: '2024-01-01T11:00:00Z' }
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: projects,
                error: null
              }))
            }))
          }))
        }))
      } as any);

      const sorted = await portfolioStore.getProjects();
      
      expect(sorted[0].id).toBe('2'); // Pinned first
      expect(sorted[1].id).toBe('3'); // Latest created_at
      expect(sorted[2].id).toBe('1'); // Oldest created_at
    });

    it('should filter projects by category', async () => {
      const projects: Project[] = [
        { ...mockProject, id: '1', category: 'restaurants', tags: ['restaurants'] },
        { ...mockProject, id: '2', category: 'bakeries', tags: ['bakeries'] }
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: projects,
                error: null
              }))
            }))
          }))
        }))
      } as any);

      const filtered = await portfolioStore.getProjectsByCategory('restaurants');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should return all projects for "all" category', async () => {
      const projects: Project[] = [
        { ...mockProject, id: '1', category: 'restaurants' },
        { ...mockProject, id: '2', category: 'bakeries' }
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: projects,
                error: null
              }))
            }))
          }))
        }))
      } as any);

      const all = await portfolioStore.getProjectsByCategory('all');
      
      expect(all).toHaveLength(2);
    });
  });

  describe('Manual Ordering', () => {
    it('should set and preserve manual order for category', async () => {
      const store = portfolioStore as any;
      
      portfolioStore.setManualOrderForCategory('restaurants', [3, 1, 2]);
      
      expect(store.config.manualOrderByCategory['restaurants']).toEqual([3, 1, 2]);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });

    it('should apply manual order when sorting', async () => {
      const projects: Project[] = [
        { ...mockProject, id: '1', category: 'restaurants', pinned: false },
        { ...mockProject, id: '2', category: 'restaurants', pinned: false }, 
        { ...mockProject, id: '3', category: 'restaurants', pinned: false }
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: projects,
                error: null
              }))
            }))
          }))
        }))
      } as any);

      // Set manual order: 3, 1, 2
      portfolioStore.setManualOrderForCategory('restaurants', [3, 1, 2]);
      
      const sorted = await portfolioStore.getProjectsByCategory('restaurants');
      
      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });

  describe('Statistics', () => {
    it('should calculate stats correctly', async () => {
      const projects: Project[] = [
        { ...mockProject, id: '1', serviceType: 'תמונות', category: 'restaurants' },
        { ...mockProject, id: '2', serviceType: 'סרטונים', category: 'bakeries' },
        { ...mockProject, id: '3', serviceType: 'תמונות', category: 'restaurants' }
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: projects,
                error: null
              }))
            }))
          }))
        }))
      } as any);

      const stats = await portfolioStore.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byServiceType['תמונות']).toBe(2);
      expect(stats.byServiceType['סרטונים']).toBe(1);
      expect(stats.byCategory['restaurants']).toBe(2);
      expect(stats.byCategory['bakeries']).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase errors and return empty items', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Database error' }
              }))
            }))
          }))
        }))
      } as any);

      const config = await portfolioStore.getConfig();
      
      expect(config.items).toEqual([]);
      expect(config.initialized).toBe(true); // Still initialized
    });

    it('should block concurrent mutations and log warnings', async () => {
      const store = portfolioStore as any;
      store.isMutating = true; // Simulate ongoing mutation

      const consoleSpy = vi.spyOn(console, 'warn');

      try {
        await portfolioStore.addProject({
          businessName: 'Test',
          businessType: 'מסעדה',
          serviceType: 'תמונות',
          imageAfter: 'test.jpg',
          size: 'medium',
          category: 'restaurants'
        });
      } catch (error) {
        expect(error.message).toContain('פעולה בתהליך');
      }

      expect(consoleSpy).toHaveBeenCalledWith('Mutation in progress. Ignoring addProject call.');
    });

    it('should dispatch destructive toast on mutation errors', async () => {
      mockCallPortfolioAdmin.mockRejectedValue(new Error('Network error'));

      try {
        await portfolioStore.addProject({
          businessName: 'Test',
          businessType: 'מסעדה',
          serviceType: 'תמונות',
          imageAfter: 'test.jpg',
          size: 'medium',
          category: 'restaurants'
        });
      } catch (error) {
        expect(mockDispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'showToast',
            detail: expect.objectContaining({
              type: 'error'
            })
          })
        );
      }
    });
  });

  describe('Realtime Updates', () => {
    it('should handle INSERT events correctly', () => {
      const store = portfolioStore as any;
      store.config.items = [mockProject];

      const newProject = {
        ...mockProject,
        id: 2,
        business_name: 'New Business'
      };

      store.handleRealtimeUpdate({
        eventType: 'INSERT',
        new: newProject
      });

      expect(store.config.items).toHaveLength(2);
      expect(store.config.items[0].businessName).toBe('New Business'); // Should be at beginning
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });

    it('should handle UPDATE events correctly', () => {
      const store = portfolioStore as any;
      store.config.items = [mockProject];

      const updatedProject = {
        ...mockProject,
        id: 1,
        business_name: 'Updated Business'
      };

      store.handleRealtimeUpdate({
        eventType: 'UPDATE',
        new: updatedProject
      });

      expect(store.config.items[0].businessName).toBe('Updated Business');
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });

    it('should handle DELETE events correctly', () => {
      const store = portfolioStore as any;
      store.config.items = [mockProject, { ...mockProject, id: '2' }];

      store.handleRealtimeUpdate({
        eventType: 'DELETE',
        old: { id: 1 }
      });

      expect(store.config.items).toHaveLength(1);
      expect(store.config.items[0].id).toBe('2');
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });

    it('should ignore realtime updates for non-existent items', () => {
      const store = portfolioStore as any;
      store.config.items = [mockProject];
      const initialLength = store.config.items.length;

      store.handleRealtimeUpdate({
        eventType: 'UPDATE',
        new: { id: 999, business_name: 'Non-existent' }
      });

      expect(store.config.items).toHaveLength(initialLength);
      // Should not dispatch update event for non-existent items
      expect(mockDispatchEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });
  });

  describe('Toggle Pinned', () => {
    it('should toggle pinned status and update Supabase', async () => {
      await portfolioStore.getConfig(); // Load initial data

      const result = await portfolioStore.togglePinned('1');

      expect(result).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: PORTFOLIO_UPDATE_EVENT })
      );
    });
  });
});