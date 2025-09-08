import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminSolutions from '@/pages/admin/solutions';
import { solutionsStore } from '@/data/solutionsStore';
import { SolutionsConfig } from '@/types/solutions';

// Mock dependencies
vi.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({
    user: { id: 'test-user', email: 'admin@test.com' },
    isLoading: false,
    isAdmin: true
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/data/solutionsStore', () => ({
  solutionsStore: {
    safeGetConfigOrDefaults: vi.fn(),
    fetchFromSupabase: vi.fn(),
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    saveToSupabase: vi.fn(),
    generateId: vi.fn(),
    exportConfig: vi.fn(),
    importConfig: vi.fn(),
    resetToDefaults: vi.fn()
  }
}));

vi.mock('@/components/admin/solutions/AdminSolutionsList', () => ({
  default: ({ items, onReorder, onEdit, onDuplicate, onDelete, onToggleEnabled }: any) => (
    <div data-testid="admin-solutions-list">
      {items.map((item: any) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span>{item.title}</span>
          <button onClick={() => onEdit(item)} data-testid={`edit-${item.id}`}>
            Edit
          </button>
          <button onClick={() => onDuplicate(item)} data-testid={`duplicate-${item.id}`}>
            Duplicate
          </button>
          <button onClick={() => onDelete(item.id)} data-testid={`delete-${item.id}`}>
            Delete
          </button>
          <button 
            onClick={() => onToggleEnabled(item.id, !item.enabled)}
            data-testid={`toggle-${item.id}`}
          >
            Toggle: {item.enabled ? 'Enabled' : 'Disabled'}
          </button>
          <button 
            onClick={() => onReorder([...items].reverse())} 
            data-testid="reorder-button"
          >
            Reorder
          </button>
        </div>
      ))}
    </div>
  )
}));

vi.mock('@/components/admin/solutions/AdminSolutionsEditor', () => ({
  default: ({ isOpen, editingCard, onSave, onClose }: any) => (
    isOpen ? (
      <div data-testid="admin-solutions-editor">
        <span>Editing: {editingCard?.title || 'New Card'}</span>
        <button 
          onClick={() => onSave({ 
            id: editingCard?.id || '', 
            title: 'Saved Card',
            enabled: true,
            order: 0
          })}
          data-testid="save-card"
        >
          Save
        </button>
        <button onClick={onClose} data-testid="close-editor">
          Close
        </button>
      </div>
    ) : null
  )
}));

const mockSolutionsStore = vi.mocked(solutionsStore);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/admin/solutions']}>
    {children}
  </MemoryRouter>
);

describe('AdminSolutions', () => {
  const mockConfig: SolutionsConfig = {
    sectionTitle: 'Test Solutions',
    sectionSubtitle: 'Test subtitle',
    items: [
      {
        id: 'item-1',
        title: 'Item 1',
        enabled: true,
        order: 0,
        imageSrc: 'test1.jpg',
        tagSlug: 'item1'
      },
      {
        id: 'item-2', 
        title: 'Item 2',
        enabled: false,
        order: 1,
        imageSrc: 'test2.jpg',
        videoSrc: 'video2.mp4',
        href: '/custom-link'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(mockConfig);
    mockSolutionsStore.fetchFromSupabase.mockResolvedValue(mockConfig);
    mockSolutionsStore.saveConfig.mockReturnValue(true);
    mockSolutionsStore.saveToSupabase.mockResolvedValue(true);
    mockSolutionsStore.generateId.mockReturnValue('generated-id');
  });

  describe('Cloud-first Initialization', () => {
    it('should load cloud config first on mount with admin auth', async () => {
      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSolutionsStore.fetchFromSupabase).toHaveBeenCalled();
      });

      expect(screen.getByText('ניהול פתרונות עסקיים')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Solutions')).toBeInTheDocument();
    });

    it('should fallback to local config if cloud fails', async () => {
      mockSolutionsStore.fetchFromSupabase.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSolutionsStore.getConfig).toHaveBeenCalled();
      });

      expect(screen.getByDisplayValue('Test Solutions')).toBeInTheDocument();
    });
  });

  describe('UI Actions', () => {
    it('should open editor when clicking "הוסף כרטיס"', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      const addButton = screen.getByText('הוסף כרטיס');
      await user.click(addButton);

      expect(screen.getByTestId('admin-solutions-editor')).toBeInTheDocument();
      expect(screen.getByText('Editing: New Card')).toBeInTheDocument();
    });

    it('should duplicate card with unique id and incremented order', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-solutions-list')).toBeInTheDocument();
      });

      const duplicateButton = screen.getByTestId('duplicate-item-1');
      await user.click(duplicateButton);

      expect(mockSolutionsStore.generateId).toHaveBeenCalledWith('Item 1 העתק');
      expect(screen.getByTestId('admin-solutions-editor')).toBeInTheDocument();
    });

    it('should toggle enabled status and mark as dirty', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('toggle-item-1')).toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId('toggle-item-1');
      await user.click(toggleButton);

      expect(mockSolutionsStore.saveConfig).toHaveBeenCalled();
      expect(screen.getByText('יש שינויים שלא נשמרו')).toBeInTheDocument();
    });

    it('should call saveToSupabase when clicking "שמירה"', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      // First make a change to enable save button
      const titleInput = screen.getByDisplayValue('Test Solutions');
      await user.clear(titleInput);
      await user.type(titleInput, 'Modified Title');

      await waitFor(() => {
        expect(screen.getByText('יש שינויים שלא נשמרו')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('שמירה');
      await user.click(saveButton);

      expect(mockSolutionsStore.saveToSupabase).toHaveBeenCalled();
    });

    it('should handle reorder via AdminSolutionsList', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('reorder-button')).toBeInTheDocument();
      });

      const reorderButton = screen.getByTestId('reorder-button');
      await user.click(reorderButton);

      expect(mockSolutionsStore.saveConfig).toHaveBeenCalled();
    });
  });

  describe('Stats Panel', () => {
    it('should calculate stats correctly', async () => {
      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('סטטיסטיקות')).toBeInTheDocument();
      });

      // Total cards
      expect(screen.getByText('2')).toBeInTheDocument(); // Total count

      // Enabled count
      const enabledCount = screen.getByText('1'); // Only item-1 is enabled
      expect(enabledCount).toBeInTheDocument();

      // With video count  
      const videoCount = screen.getByText('1'); // Only item-2 has video
      expect(videoCount).toBeInTheDocument();

      // With href count
      const hrefCount = screen.getByText('1'); // Only item-2 has href
      expect(hrefCount).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should update view when solutions:updated event fires', async () => {
      const updatedConfig = {
        ...mockConfig,
        sectionTitle: 'Updated via Event'
      };

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      // Update mock return value
      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(updatedConfig);

      // Fire the event
      window.dispatchEvent(new Event('solutions:updated'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Updated via Event')).toBeInTheDocument();
      });
    });

    it('should handle storage events for cross-tab sync', async () => {
      const updatedConfig = {
        ...mockConfig,
        sectionTitle: 'Updated via Storage'
      };

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      // Update mock return value
      mockSolutionsStore.safeGetConfigOrDefaults.mockReturnValue(updatedConfig);

      // Fire storage event
      const storageEvent = new StorageEvent('storage', {
        key: 'aiMaster:solutions'
      });
      window.dispatchEvent(storageEvent);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Updated via Storage')).toBeInTheDocument();
      });
    });
  });

  describe('Card Management', () => {
    it('should save new card with generated ID', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      // Open editor
      const addButton = screen.getByText('הוסף כרטיס');
      await user.click(addButton);

      // Save card
      const saveButton = screen.getByTestId('save-card');
      await user.click(saveButton);

      expect(mockSolutionsStore.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'generated-id',
              title: 'Saved Card'
            })
          ])
        })
      );
    });

    it('should update existing card', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      // Edit existing card
      const editButton = screen.getByTestId('edit-item-1');
      await user.click(editButton);

      expect(screen.getByText('Editing: Item 1')).toBeInTheDocument();

      // Save changes
      const saveButton = screen.getByTestId('save-card');
      await user.click(saveButton);

      expect(mockSolutionsStore.saveConfig).toHaveBeenCalled();
    });

    it('should delete card and reorder', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      const deleteButton = screen.getByTestId('delete-item-1');
      await user.click(deleteButton);

      expect(mockSolutionsStore.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'item-2',
              order: 0 // Should be reordered
            })
          ])
        })
      );
    });
  });

  describe('Import/Export', () => {
    it('should export config', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/json' });
      mockSolutionsStore.exportConfig.mockReturnValue(mockBlob);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      const exportButton = screen.getByText('יצוא JSON');
      await user.click(exportButton);

      expect(mockSolutionsStore.exportConfig).toHaveBeenCalled();
    });

    it('should handle successful import', async () => {
      mockSolutionsStore.importConfig.mockReturnValue({ success: true });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      const importButton = screen.getByText('יבוא JSON');
      
      // Mock file input
      const file = new File(['{"test": true}'], 'test.json', {
        type: 'application/json'
      });

      // Simulate file selection
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });

      // Mock FileReader
      const mockReader = {
        readAsText: vi.fn(),
        result: '{"test": true}',
        onload: null as any
      };
      global.FileReader = vi.fn(() => mockReader) as any;

      await user.click(importButton);

      // Simulate FileReader completion
      mockReader.onload?.({ target: { result: '{"test": true}' } });

      expect(mockSolutionsStore.importConfig).toHaveBeenCalledWith('{"test": true}');
    });

    it('should handle reset to defaults', async () => {
      const user = userEvent.setup();

      // Mock window.confirm
      window.confirm = vi.fn(() => true);

      render(
        <TestWrapper>
          <AdminSolutions />
        </TestWrapper>
      );

      const resetButton = screen.getByText('איפוס לברירת מחדל');
      await user.click(resetButton);

      expect(mockSolutionsStore.resetToDefaults).toHaveBeenCalled();
    });
  });
});