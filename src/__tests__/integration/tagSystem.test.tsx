import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminPortfolioEditor from '@/components/admin/portfolio/AdminPortfolioEditor';
import FilterPills from '@/components/portfolio/FilterPills';
import { portfolioStore } from '@/data/portfolioStore';
import { solutionsStore } from '@/data/solutionsStore';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock('@/utils/fileUtils', () => ({
  validateImageFile: vi.fn(() => ({ isValid: true })),
  getImageDimensions: vi.fn(() => Promise.resolve({ width: 800, height: 600 })),
}));

// Component wrapper for React Router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Tag System Integration', () => {
  const mockSolutionsConfig = {
    sectionTitle: 'Test Solutions',
    sectionSubtitle: 'Test Subtitle',
    updatedAt: '2023-01-01T00:00:00Z',
    items: [
      { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
      { id: 'bakeries', title: 'מאפיות', enabled: true, order: 1 },
      { id: 'cafes', title: 'קפה ומשקאות', enabled: true, order: 2 },
      { id: 'disabled', title: 'לא פעיל', enabled: false, order: 3 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock solutions store
    vi.spyOn(solutionsStore, 'safeGetConfigOrDefaults').mockReturnValue(mockSolutionsConfig);
    
    // Mock portfolio store methods
    vi.spyOn(portfolioStore, 'getProjects').mockResolvedValue([]);
    
    // Mock successful save operations
    vi.spyOn(portfolioStore, 'addProject').mockResolvedValue({
      id: 1,
      businessName: 'Test Business',
      businessType: 'Test Type',
      serviceType: 'תמונות',
      imageAfter: 'test.jpg',
      size: 'medium',
      category: 'restaurants',
      tags: ['restaurants'],
    });
    
    vi.spyOn(portfolioStore, 'updateProject').mockResolvedValue(true);
  });

  describe('Solutions to Tags Synchronization', () => {
    it('should use enabled solutions as available tags', () => {
      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            editingProject={null}
          />
        </TestWrapper>
      );

      // Should show enabled solutions as tags
      expect(screen.getByText('מסעדות')).toBeInTheDocument();
      expect(screen.getByText('מאפיות')).toBeInTheDocument();
      expect(screen.getByText('קפה ומשקאות')).toBeInTheDocument();
      
      // Should not show disabled solutions
      expect(screen.queryByText('לא פעיל')).not.toBeInTheDocument();
    });

    it('should update tags when solutions configuration changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <FilterPills
            activeFilter="all"
            onFilterChange={vi.fn()}
          />
        </TestWrapper>
      );

      // Initially shows original tags
      expect(screen.getByText('מסעדות')).toBeInTheDocument();

      // Update solutions configuration
      const updatedConfig = {
        sectionTitle: 'Updated Solutions',
        sectionSubtitle: 'Updated Subtitle',
        updatedAt: '2023-01-02T00:00:00Z',
        items: [
          { id: 'new-category', title: 'קטגוריה חדשה', enabled: true, order: 0 },
          { id: 'restaurants', title: 'מסעדות מעודכנות', enabled: true, order: 1 },
        ],
      };
      
      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(updatedConfig);

      // Simulate solutions update event
      fireEvent(window, new Event('solutions:updated'));

      rerender(
        <TestWrapper>
          <FilterPills
            activeFilter="all"
            onFilterChange={vi.fn()}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('קטגוריה חדשה')).toBeInTheDocument();
        expect(screen.getByText('מסעדות מעודכנות')).toBeInTheDocument();
      });
    });
  });

  describe('Project Creation with Tags', () => {
    it('should create project with selected tags and sync category', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn();

      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={mockOnSave}
            editingProject={null}
          />
        </TestWrapper>
      );

      // Fill required fields
      await user.type(screen.getByPlaceholderText('שם העסק'), 'Test Business');
      await user.type(screen.getByPlaceholderText('סוג העסק'), 'Test Type');

      // Select tags
      await user.click(screen.getByText('מאפיות'));
      await user.click(screen.getByText('קפה ומשקאות'));

      // Mock file upload
      const fileInput = screen.getByLabelText(/העלה תמונה "אחרי"/);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(fileInput, 'files', { value: [file] });
      fireEvent.change(fileInput);

      // Save project
      await user.click(screen.getByText('שמור'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            businessName: 'Test Business',
            businessType: 'Test Type',
            tags: ['bakeries', 'cafes'],
            category: 'bakeries', // Should be set to first tag
          })
        );
      });
    });
  });

  describe('Project Editing with Tags', () => {
    it('should handle tag changes and trigger auto-save', async () => {
      const user = userEvent.setup();
      const mockOnAutoSave = vi.fn();

      const existingProject = {
        id: 1,
        businessName: 'Existing Business',
        businessType: 'Existing Type',
        serviceType: 'תמונות' as const,
        imageAfter: 'existing.jpg',
        size: 'medium' as const,
        category: 'restaurants',
        tags: ['restaurants'],
      };

      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            onAutoSave={mockOnAutoSave}
            editingProject={existingProject}
          />
        </TestWrapper>
      );

      // Add additional tag
      await user.click(screen.getByText('מאפיות'));

      // Should trigger auto-save with updated tags
      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expect.arrayContaining(['restaurants', 'bakeries']),
          })
        );
      }, { timeout: 2000 });
    });

    it('should remove tags when deselected', async () => {
      const user = userEvent.setup();
      const mockOnAutoSave = vi.fn();

      const existingProject = {
        id: 1,
        businessName: 'Existing Business',
        businessType: 'Existing Type',
        serviceType: 'תמונות' as const,
        imageAfter: 'existing.jpg',
        size: 'medium' as const,
        category: 'restaurants',
        tags: ['restaurants', 'bakeries'],
      };

      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            onAutoSave={mockOnAutoSave}
            editingProject={existingProject}
          />
        </TestWrapper>
      );

      // Remove a tag
      await user.click(screen.getByText('מאפיות'));

      // Should trigger auto-save with removed tag
      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['restaurants'],
          })
        );
      }, { timeout: 2000 });
    });
  });

  describe('Tag Filtering', () => {
    it('should filter portfolio based on selected tags', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();

      render(
        <TestWrapper>
          <FilterPills
            activeFilter="all"
            onFilterChange={mockOnFilterChange}
          />
        </TestWrapper>
      );

      // Click on a specific tag filter
      await user.click(screen.getByText('מאפיות'));

      expect(mockOnFilterChange).toHaveBeenCalledWith('bakeries');
    });

    it('should highlight active filter correctly', () => {
      render(
        <TestWrapper>
          <FilterPills
            activeFilter="restaurants"
            onFilterChange={vi.fn()}
          />
        </TestWrapper>
      );

      const restaurantsButton = screen.getByText('מסעדות');
      const bakeriesButton = screen.getByText('מאפיות');

      expect(restaurantsButton.closest('button')).toHaveClass('bg-primary');
      expect(bakeriesButton.closest('button')).not.toHaveClass('bg-primary');
    });
  });

  describe('Tag Validation and Synchronization', () => {
    it('should handle invalid tags gracefully', () => {
      const projectWithInvalidTags = {
        id: 1,
        businessName: 'Test Business',
        businessType: 'Test Type',
        serviceType: 'תמונות' as const,
        imageAfter: 'test.jpg',
        size: 'medium' as const,
        category: 'restaurants',
        tags: ['restaurants', 'invalid-tag', 'another-invalid'],
      };

      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            editingProject={projectWithInvalidTags}
          />
        </TestWrapper>
      );

      // Should only show valid tags as selected
      const restaurantsButton = screen.getByText('מסעדות');
      expect(restaurantsButton.closest('button')).toHaveClass('ring-2');

      // Invalid tags should not appear or be selected
      expect(screen.queryByText('invalid-tag')).not.toBeInTheDocument();
    });

    it('should maintain tag-category synchronization', async () => {
      const user = userEvent.setup();
      const mockOnAutoSave = vi.fn();

      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            onAutoSave={mockOnAutoSave}
            editingProject={null}
          />
        </TestWrapper>
      );

      // Select first tag
      await user.click(screen.getByText('קפה ומשקאות'));

      // Category should be updated to match first tag
      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'cafes',
            tags: ['cafes'],
          })
        );
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid tag changes without performance issues', async () => {
      const user = userEvent.setup();
      const mockOnAutoSave = vi.fn();

      const existingProject = {
        id: 1,
        businessName: 'Test Business',
        businessType: 'Test Type',
        serviceType: 'תמונות' as const,
        imageAfter: 'test.jpg',
        size: 'medium' as const,
        category: 'restaurants',
        tags: ['restaurants'],
      };

      render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            onAutoSave={mockOnAutoSave}
            editingProject={existingProject}
          />
        </TestWrapper>
      );

      // Rapidly change tags
      await user.click(screen.getByText('מאפיות'));
      await user.click(screen.getByText('קפה ומשקאות'));
      await user.click(screen.getByText('מאפיות'));

      // Should debounce and only call auto-save once
      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
    });

    it('should clean up event listeners when component unmounts', () => {
      const { unmount } = render(
        <TestWrapper>
          <AdminPortfolioEditor
            isOpen={true}
            onClose={vi.fn()}
            onSave={vi.fn()}
            editingProject={null}
          />
        </TestWrapper>
      );

      // Should not throw errors when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });
});