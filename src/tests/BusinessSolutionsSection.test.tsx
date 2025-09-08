import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BusinessSolutionsSection from '@/components/solutions/BusinessSolutionsSection';
import { solutionsStore } from '@/data/solutionsStore';
import { SolutionsConfig } from '@/types/solutions';

// Mock the solutionsStore
vi.mock('@/data/solutionsStore', () => ({
  solutionsStore: {
    safeGetConfigOrDefaults: vi.fn(),
    fetchFromSupabase: vi.fn(),
    getConfig: vi.fn()
  }
}));

const mockSolutionsStore = vi.mocked(solutionsStore);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('BusinessSolutionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  describe('Happy Path - Cloud-first rendering', () => {
    it('should render enabled items only, sorted by order', async () => {
      const mockConfig: SolutionsConfig = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test subtitle',
        items: [
          {
            id: 'disabled-item',
            title: 'Disabled Item',
            enabled: false,
            order: 0,
            tagSlug: 'disabled'
          },
          {
            id: 'second-item',
            title: 'Second Item',
            enabled: true,
            order: 1,
            tagSlug: 'second'
          },
          {
            id: 'first-item',
            title: 'First Item', 
            enabled: true,
            order: 0,
            tagSlug: 'first'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(mockConfig);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(mockConfig);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      // Should show section title and subtitle
      expect(screen.getByText('Test Solutions')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();

      // Should show only enabled items
      expect(screen.getByText('First Item')).toBeInTheDocument();
      expect(screen.getByText('Second Item')).toBeInTheDocument();
      expect(screen.queryByText('Disabled Item')).not.toBeInTheDocument();

      // Should fetch from cloud first
      await waitFor(() => {
        expect(mockSolutionsStore.fetchFromSupabase).toHaveBeenCalled();
      });
    });

    it('should render cards with correct links when tagSlug is set', () => {
      const mockConfig: SolutionsConfig = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test subtitle',
        items: [
          {
            id: 'restaurants',
            title: 'Restaurants',
            enabled: true,
            order: 0,
            tagSlug: 'restaurants',
            imageSrc: 'test.jpg'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(mockConfig);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      const link = screen.getByLabelText('פתיחת קטלוג מסונן: Restaurants');
      expect(link).toHaveAttribute('href', '/portfolio?tag=restaurants');
    });

    it('should prioritize custom href over tagSlug', () => {
      const mockConfig: SolutionsConfig = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test subtitle',
        items: [
          {
            id: 'custom',
            title: 'Custom Link',
            enabled: true,
            order: 0,
            tagSlug: 'should-be-ignored',
            href: '/custom-page',
            imageSrc: 'test.jpg'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(mockConfig);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      const link = screen.getByLabelText('פתיחת קטלוג מסונן: Custom Link');
      expect(link).toHaveAttribute('href', '/custom-page');
    });

    it('should render non-clickable card when no href or tagSlug', () => {
      const mockConfig: SolutionsConfig = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test subtitle',
        items: [
          {
            id: 'no-link',
            title: 'No Link Item',
            enabled: true,
            order: 0,
            imageSrc: 'test.jpg'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(mockConfig);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      const cardContainer = screen.getByText('No Link Item').closest('div');
      expect(cardContainer).toHaveAttribute('aria-disabled', 'true');
      expect(screen.queryByLabelText(/פתיחת קטלוג מסונן/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render empty grid gracefully when no items', () => {
      const emptyConfig: SolutionsConfig = {
        sectionTitle: 'No Items',
        sectionSubtitle: 'Empty config',
        items: [],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(emptyConfig);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(emptyConfig);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      expect(screen.getByText('No Items')).toBeInTheDocument();
      expect(screen.getByText('Empty config')).toBeInTheDocument();
      // Grid should exist but be empty
      const grids = document.querySelectorAll('.grid, .flex');
      expect(grids).toHaveLength(2); // Desktop grid + mobile flex
    });

    it('should handle invalid items array gracefully', () => {
      const invalidConfig = {
        sectionTitle: 'Test',
        sectionSubtitle: 'Test',
        items: null, // Invalid items
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(invalidConfig as any);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      // Should not crash and should render headers
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should render video with image fallback', () => {
      const configWithVideo: SolutionsConfig = {
        sectionTitle: 'Video Test',
        sectionSubtitle: 'Test',
        items: [
          {
            id: 'video-item',
            title: 'Video Item',
            enabled: true,
            order: 0,
            imageSrc: 'fallback.jpg',
            videoSrc: 'video.mp4',
            tagSlug: 'video'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(configWithVideo);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      // Should have both video and fallback image
      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('poster', 'fallback.jpg');
      
      const fallbackImg = document.querySelector('video img');
      expect(fallbackImg).toBeInTheDocument();
      expect(fallbackImg).toHaveAttribute('src', 'fallback.jpg');
    });

    it('should handle mobile layout (innerWidth < 1024)', () => {
      // Mock mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      const mockConfig: SolutionsConfig = {
        sectionTitle: 'Mobile Test',
        sectionSubtitle: 'Test',
        items: [
          { id: '1', title: 'Item 1', enabled: true, order: 0, tagSlug: 'item1' },
          { id: '2', title: 'Item 2', enabled: true, order: 1, tagSlug: 'item2' }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(mockConfig);
      mockSolutionsStore.fetchFromSupabase.mockResolvedValue(null);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      // Should show mobile layout indicators (dots)
      const dots = document.querySelectorAll('.w-2.h-2.rounded-full');
      expect(dots).toHaveLength(2); // One dot per item
    });
  });

  describe('Error Handling', () => {
    it('should fallback to local config when fetchFromSupabase rejects', async () => {
      const localConfig: SolutionsConfig = {
        sectionTitle: 'Local Fallback',
        sectionSubtitle: 'From localStorage',
        items: [
          { id: 'local', title: 'Local Item', enabled: true, order: 0 }
        ],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.fetchFromSupabase.mockRejectedValue(new Error('Network error'));
      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(localConfig);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      // Should eventually show local config
      await waitFor(() => {
        expect(screen.getByText('Local Fallback')).toBeInTheDocument();
        expect(screen.getByText('Local Item')).toBeInTheDocument();
      });
    });

    it('should handle event listener cleanup', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue({
        sectionTitle: 'Test',
        sectionSubtitle: 'Test',
        items: [],
        updatedAt: new Date().toISOString()
      });

      const { unmount } = render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      // Should add event listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('solutions:updated', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('solutions:save_failed', expect.any(Function));

      unmount();

      // Should remove event listeners on cleanup
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('solutions:updated', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('solutions:save_failed', expect.any(Function));
    });

    it('should handle storage events for cross-tab updates', async () => {
      const mockConfig: SolutionsConfig = {
        sectionTitle: 'Initial Title',
        sectionSubtitle: 'Initial Subtitle',
        items: [],
        updatedAt: new Date().toISOString()
      };

      const updatedConfig: SolutionsConfig = {
        sectionTitle: 'Updated Title',
        sectionSubtitle: 'Updated Subtitle', 
        items: [],
        updatedAt: new Date().toISOString()
      };

      mockSolutionsStore.safeGetConfigOrDefaults
        .mockReturnValueOnce(mockConfig)
        .mockReturnValueOnce(updatedConfig);

      render(
        <TestWrapper>
          <BusinessSolutionsSection />
        </TestWrapper>
      );

      expect(screen.getByText('Initial Title')).toBeInTheDocument();

      // Simulate storage event
      const storageEvent = new StorageEvent('storage', {
        key: 'aiMaster:solutions',
        newValue: JSON.stringify(updatedConfig)
      });
      window.dispatchEvent(storageEvent);

      await waitFor(() => {
        expect(screen.getByText('Updated Title')).toBeInTheDocument();
      });
    });
  });
});