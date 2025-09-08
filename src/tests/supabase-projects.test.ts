import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callPortfolioAdmin, fetchProjectsFromSupabase } from '@/lib/supabase-projects';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

const mockSupabase = vi.mocked(supabase);

describe('supabase-projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful mocks
    vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user-id', email: 'admin@test.com' } 
        } 
      },
      error: null
    } as any);

    mockSupabase.rpc.mockResolvedValue({
      data: { email: 'admin@test.com', user_id: 'test-user-id' },
      error: null
    } as any);

    vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
      data: { ok: true, data: { id: 1, created_at: '2024-01-01T10:00:00Z' } },
      error: null
    } as any);
  });

  describe('Happy Path - callPortfolioAdmin', () => {
    it('should verify auth session exists', async () => {
      await callPortfolioAdmin('add', { business_name: 'Test' });
      
      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    });

    it('should verify admin status via get_admin_user RPC', async () => {
      await callPortfolioAdmin('add', { business_name: 'Test' });
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_admin_user', {
        user_id_param: 'test-user-id'
      });
    });

    it('should call portfolio-admin function with correct body', async () => {
      const payload = { business_name: 'Test Business' };
      
      await callPortfolioAdmin('add', payload);
      
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: { action: 'add', payload }
      });
    });

    it('should return response.data.data on success', async () => {
      const expectedData = { id: 123, business_name: 'Test' };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { ok: true, data: expectedData },
        error: null
      } as any);

      const result = await callPortfolioAdmin('add', { business_name: 'Test' });
      
      expect(result).toEqual(expectedData);
    });

    it('should handle different action types correctly', async () => {
      const actions = ['add', 'update', 'delete'];
      
      for (const action of actions) {
        await callPortfolioAdmin(action, { id: 1 });
        
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
          body: { action, payload: { id: 1 } }
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw when user not authenticated (no session)', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('User not authenticated. Please log in.');
    });

    it('should throw when user not authenticated (no user)', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: null } },
        error: null
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('User not authenticated. Please log in.');
    });

    it('should throw when admin RPC returns error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Access denied. Admin privileges required.');
    });

    it('should throw when admin RPC returns no data', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Access denied. Admin privileges required.');
    });

    it('should throw when function invocation returns error', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Function execution failed' }
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Function execution failed');
    });

    it('should throw when function response has no error but ok is false', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { ok: false, error: 'Custom error message' },
        error: null
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Custom error message');
    });

    it('should throw generic error when ok is false and no error message', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { ok: false },
        error: null
      } as any);

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Unknown error occurred');
    });

    it('should handle function invocation throwing exception', async () => {
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'));

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Network error');
    });

    it('should handle auth session throwing exception', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Auth error'));

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('Auth error');
    });

    it('should handle RPC throwing exception', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('RPC exception'));

      await expect(callPortfolioAdmin('add', {}))
        .rejects.toThrow('RPC exception');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty payload', async () => {
      const result = await callPortfolioAdmin('delete', {});
      
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: { action: 'delete', payload: {} }
      });
      expect(result).toBeDefined();
    });

    it('should handle large payload', async () => {
      const largePayload = {
        business_name: 'A'.repeat(10000),
        description: 'B'.repeat(10000)
      };

      await callPortfolioAdmin('add', largePayload);
      
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: { action: 'add', payload: largePayload }
      });
    });

    it('should handle special characters in payload', async () => {
      const specialPayload = {
        business_name: 'Test & Co. "Special" Characters',
        notes: 'Unicode: 🍕 Hebrew: מסעדה'
      };

      await callPortfolioAdmin('update', specialPayload);
      
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('portfolio-admin', {
        body: { action: 'update', payload: specialPayload }
      });
    });
  });

  describe('fetchProjectsFromSupabase', () => {
    it('should fetch and convert projects successfully', async () => {
      const mockDbProjects = [
        {
          id: 1,
          business_name: 'Test Restaurant',
          business_type: 'מסעדה',
          service_type: 'תמונות',
          image_after: 'after.jpg',
          image_before: 'before.jpg',
          size: 'medium',
          category: 'restaurants',
          pinned: false,
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockDbProjects,
            error: null
          }))
        }))
      } as any);

      const result = await fetchProjectsFromSupabase();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        businessName: 'Test Restaurant',
        businessType: 'מסעדה',
        serviceType: 'תמונות',
        imageAfter: 'after.jpg',
        imageBefore: 'before.jpg',
        size: 'medium',
        category: 'restaurants',
        pinned: false,
        createdAt: '2024-01-01T10:00:00Z'
      });
    });

    it('should return empty array when no projects', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      } as any);

      const result = await fetchProjectsFromSupabase();
      
      expect(result).toEqual([]);
    });

    it('should throw on Supabase error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      } as any);

      await expect(fetchProjectsFromSupabase()).rejects.toThrow('Database error');
    });

    it('should handle null/undefined data gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: null,
            error: null
          }))
        }))
      } as any);

      const result = await fetchProjectsFromSupabase();
      
      expect(result).toEqual([]);
    });

    it('should convert project fields correctly', async () => {
      const mockDbProject = {
        id: 123,
        business_name: 'Test Café',
        business_type: 'בית קפה',
        service_type: 'סרטונים',
        image_after: 'https://example.com/after.jpg',
        image_before: 'https://example.com/before.jpg',
        size: 'large',
        category: 'cafes',
        pinned: true,
        created_at: '2024-01-01T10:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [mockDbProject],
            error: null
          }))
        }))
      } as any);

      const result = await fetchProjectsFromSupabase();
      
      expect(result[0]).toEqual({
        id: '123',
        businessName: 'Test Café',
        businessType: 'בית קפה',
        serviceType: 'סרטונים',
        imageAfter: 'https://example.com/after.jpg',
        imageBefore: 'https://example.com/before.jpg',
        size: 'large',
        category: 'cafes',
        pinned: true,
        createdAt: '2024-01-01T10:00:00Z'
      });
    });

    it('should order by created_at descending', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      } as any);

      await fetchProjectsFromSupabase();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      const selectCall = mockSupabase.from().select;
      expect(selectCall).toHaveBeenCalledWith('*');
      
      const orderCall = selectCall().order;
      expect(orderCall).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});