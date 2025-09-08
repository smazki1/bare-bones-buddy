import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPortfolioEditor from '../AdminPortfolioEditor';
import type { Project } from '@/data/portfolioMock';

// Mock dependencies
vi.mock('@/utils/tagUtils', () => ({
  getAvailableTags: vi.fn(() => [
    { label: 'הכל', slug: 'all' },
    { label: 'מסעדות', slug: 'restaurants' },
    { label: 'מאפיות', slug: 'bakeries' },
    { label: 'קפה ומשקאות', slug: 'cafes' },
  ]),
  syncProjectTags: vi.fn((tags) => tags || ['restaurants']),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/utils/fileUtils', () => ({
  validateImageFile: vi.fn(() => ({ isValid: true })),
  getImageDimensions: vi.fn(() => Promise.resolve({ width: 800, height: 600 })),
}));

describe('AdminPortfolioEditor', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnAutoSave = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    editingProject: null,
    onAutoSave: mockOnAutoSave,
  };

  const mockProject: Project = {
    id: '1',
    businessName: 'Test Business',
    businessType: 'Test Type',
    serviceType: 'תמונות' as const,
    imageAfter: 'test-image.jpg',
    size: 'medium' as const,
    category: 'restaurants',
    tags: ['restaurants', 'bakeries'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tag Management', () => {
    it('should display available tags for selection', async () => {
      render(<AdminPortfolioEditor {...defaultProps} />);

      expect(screen.getByText('תגיות:')).toBeInTheDocument();
      expect(screen.getByText('מסעדות')).toBeInTheDocument();
      expect(screen.getByText('מאפיות')).toBeInTheDocument();
      expect(screen.getByText('קפה ומשקאות')).toBeInTheDocument();
    });

    it('should show selected tags when editing project', () => {
      render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={mockProject}
        />
      );

      // Should show selected tags as active
      const restaurantsTag = screen.getByText('מסעדות');
      const bakeriesTag = screen.getByText('מאפיות');
      
      expect(restaurantsTag.closest('button')).toHaveClass('ring-2');
      expect(bakeriesTag.closest('button')).toHaveClass('ring-2');
    });

    it('should allow adding tags', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      const cafesTag = screen.getByText('קפה ומשקאות');
      await user.click(cafesTag);

      expect(cafesTag.closest('button')).toHaveClass('ring-2');
    });

    it('should allow removing tags', async () => {
      const user = userEvent.setup();
      render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={mockProject}
        />
      );

      const restaurantsTag = screen.getByText('מסעדות');
      await user.click(restaurantsTag);

      expect(restaurantsTag.closest('button')).not.toHaveClass('ring-2');
    });

    it('should trigger auto-save when tags change on existing project', async () => {
      const user = userEvent.setup();
      render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={mockProject}
        />
      );

      const cafesTag = screen.getByText('קפה ומשקאות');
      await user.click(cafesTag);

      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expect.arrayContaining(['cafes']),
          })
        );
      }, { timeout: 2000 });
    });

    it('should update category when adding first tag', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      const bakeriesTag = screen.getByText('מאפיות');
      await user.click(bakeriesTag);

      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'bakeries',
            tags: ['bakeries'],
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should require business name for save', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      const saveButton = screen.getByText('שמור');
      await user.click(saveButton);

      expect(screen.getByText('נא למלא את שם העסק')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should require after image for save', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      const businessNameInput = screen.getByPlaceholderText('שם העסק');
      await user.type(businessNameInput, 'Test Business');

      const saveButton = screen.getByText('שמור');
      await user.click(saveButton);

      expect(screen.getByText('נא להעלות תמונה של "אחרי"')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should save successfully with valid data', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      // Fill required fields
      const businessNameInput = screen.getByPlaceholderText('שם העסק');
      await user.type(businessNameInput, 'Test Business');

      const businessTypeInput = screen.getByPlaceholderText('סוג העסק');
      await user.type(businessTypeInput, 'Test Type');

      // Mock file upload
      const fileInput = screen.getByLabelText(/העלה תמונה "אחרי"/);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        const saveButton = screen.getByText('שמור');
        user.click(saveButton);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            businessName: 'Test Business',
            businessType: 'Test Type',
            tags: expect.any(Array),
          })
        );
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('should not auto-save for new projects', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      const businessNameInput = screen.getByPlaceholderText('שם העסק');
      await user.type(businessNameInput, 'Test');

      // Wait to ensure no auto-save is triggered
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      expect(mockOnAutoSave).not.toHaveBeenCalled();
    });

    it('should auto-save after changes for existing projects', async () => {
      const user = userEvent.setup();
      render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={mockProject}
        />
      );

      const businessNameInput = screen.getByDisplayValue('Test Business');
      await user.clear(businessNameInput);
      await user.type(businessNameInput, 'Updated Business');

      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            businessName: 'Updated Business',
          })
        );
      }, { timeout: 2000 });
    });

    it('should debounce auto-save calls', async () => {
      const user = userEvent.setup();
      render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={mockProject}
        />
      );

      const businessNameInput = screen.getByDisplayValue('Test Business');
      
      // Make rapid changes
      await user.clear(businessNameInput);
      await user.type(businessNameInput, 'A');
      await user.type(businessNameInput, 'B');
      await user.type(businessNameInput, 'C');

      // Should only call auto-save once after debounce
      await waitFor(() => {
        expect(mockOnAutoSave).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
    });
  });

  describe('Image Upload', () => {
    it('should handle image upload for after image', async () => {
      const user = userEvent.setup();
      render(<AdminPortfolioEditor {...defaultProps} />);

      const fileInput = screen.getByLabelText(/העלה תמונה "אחרי"/);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });

    it('should handle image upload for before image', async () => {
      render(<AdminPortfolioEditor {...defaultProps} />);

      const fileInput = screen.getByLabelText(/העלה תמונה "לפני"/);
      const file = new File(['test'], 'before.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('before.jpg')).toBeInTheDocument();
      });
    });

    it('should allow removing uploaded images', async () => {
      const user = userEvent.setup();
      render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={{
            ...mockProject,
            imageBefore: 'existing-before.jpg'
          }}
        />
      );

      const removeButton = screen.getByLabelText(/הסר תמונה "לפני"/);
      await user.click(removeButton);

      expect(screen.queryByText('existing-before.jpg')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Tag System', () => {
    it('should sync tags when project data changes', () => {
      const { rerender } = render(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={mockProject}
        />
      );

      const updatedProject = {
        ...mockProject,
        tags: ['restaurants', 'invalid-tag', 'cafes']
      };

      rerender(
        <AdminPortfolioEditor 
          {...defaultProps} 
          editingProject={updatedProject}
        />
      );

      // Should call syncProjectTags to clean invalid tags
      const { syncProjectTags } = require('@/utils/tagUtils');
      expect(syncProjectTags).toHaveBeenCalledWith(['restaurants', 'invalid-tag', 'cafes']);
    });

    it('should update available tags when solutions change', async () => {
      const { getAvailableTags } = require('@/utils/tagUtils');
      
      // Change available tags
      getAvailableTags.mockReturnValue([
        { label: 'הכל', slug: 'all' },
        { label: 'מסעדות חדשות', slug: 'new-restaurants' },
      ]);

      // Simulate external update event
      fireEvent(window, new Event('solutions:updated'));

      render(<AdminPortfolioEditor {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('מסעדות חדשות')).toBeInTheDocument();
      });
    });
  });
});