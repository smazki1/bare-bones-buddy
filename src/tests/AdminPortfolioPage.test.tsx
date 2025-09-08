import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminPortfolioPage from '@/pages/admin/portfolio';
import { portfolioStore, PORTFOLIO_UPDATE_EVENT } from '@/data/portfolioStore';
import { Project } from '@/data/portfolioMock';

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

vi.mock('@/data/portfolioStore', () => ({
  portfolioStore: {
    getProjects: vi.fn(),
    getStats: vi.fn(),
    addProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    exportConfig: vi.fn(),
    importConfig: vi.fn(),
    setProjects: vi.fn(),
    reset: vi.fn()
  },
  PORTFOLIO_UPDATE_EVENT: 'portfolioConfigUpdate'
}));

vi.mock('@/components/admin/portfolio/AdminPortfolioEditor', () => ({
  default: ({ isOpen, editingProject, onSave, onAutoSave, onClose }: any) => (
    isOpen ? (
      <div data-testid="admin-portfolio-editor">
        <span>Editing: {editingProject?.businessName || 'New Project'}</span>
        <button 
          onClick={() => onSave({
            id: editingProject?.id,
            businessName: 'Saved Project',
            businessType: 'מסעדה',
            serviceType: 'תמונות',
            imageAfter: 'saved.jpg',
            size: 'medium',
            category: 'restaurants'
          })}
          data-testid="save-project"
        >
          Save
        </button>
        <button 
          onClick={() => onAutoSave({
            id: editingProject?.id,
            businessName: 'Auto Saved',
            businessType: 'מסעדה',
            serviceType: 'תמונות',
            imageAfter: 'auto-saved.jpg',
            size: 'medium',
            category: 'restaurants',
            tags: ['restaurants']
          })}
          data-testid="auto-save"
        >
          Auto Save
        </button>
        <button onClick={onClose} data-testid="close-editor">
          Close
        </button>
      </div>
    ) : null
  )
}));

vi.mock('@/components/admin/portfolio/AdminPortfolioList', () => ({
  default: ({ projects, onEdit, onDelete, onDuplicate }: any) => (
    <div data-testid="admin-portfolio-list">
      {projects.map((project: Project) => (
        <div key={project.id} data-testid={`project-${project.id}`}>
          <span>{project.businessName}</span>
          <button onClick={() => onEdit(project)} data-testid={`edit-${project.id}`}>
            Edit
          </button>
          <button onClick={() => onDelete(project.id)} data-testid={`delete-${project.id}`}>
            Delete
          </button>
          <button onClick={() => onDuplicate(project)} data-testid={`duplicate-${project.id}`}>
            Duplicate
          </button>
        </div>
      ))}
    </div>
  )
}));

const mockPortfolioStore = vi.mocked(portfolioStore);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/admin/portfolio']}>
    {children}
  </MemoryRouter>
);

describe('AdminPortfolioPage', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      businessName: 'Test Restaurant',
      businessType: 'מסעדה',
      serviceType: 'תמונות',
      imageAfter: 'after1.jpg',
      imageBefore: 'before1.jpg',
      size: 'medium',
      category: 'restaurants',
      tags: ['restaurants'],
      pinned: false,
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      businessName: 'Test Bakery',
      businessType: 'מאפייה',
      serviceType: 'סרטונים',
      imageAfter: 'after2.jpg',
      size: 'large',
      category: 'bakeries',
      tags: ['bakeries'],
      pinned: true,
      createdAt: '2024-01-02T10:00:00Z'
    }
  ];

  const mockStats = {
    total: 2,
    byServiceType: { 'תמונות': 1, 'סרטונים': 1 },
    byCategory: { 'restaurants': 1, 'bakeries': 1 },
    lastUpdated: '2024-01-02T10:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPortfolioStore.getProjects.mockResolvedValue(mockProjects);
    mockPortfolioStore.getStats.mockResolvedValue(mockStats);
    mockPortfolioStore.addProject.mockResolvedValue(mockProjects[0]);
    mockPortfolioStore.updateProject.mockResolvedValue(true);
    mockPortfolioStore.deleteProject.mockResolvedValue(true);
  });

  describe('Cloud Load and Data Display', () => {
    it('should load projects and stats on mount', async () => {
      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPortfolioStore.getProjects).toHaveBeenCalled();
        expect(mockPortfolioStore.getStats).toHaveBeenCalled();
      });

      expect(screen.getByText('ניהול קטלוג הפרויקטים')).toBeInTheDocument();
      expect(screen.getByTestId('admin-portfolio-list')).toBeInTheDocument();
    });

    it('should display stats correctly', async () => {
      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total projects
      });

      expect(screen.getByText('סטטיסטיקות')).toBeInTheDocument();
      // Should show service type breakdown
      const serviceTypes = screen.getAllByText('1');
      expect(serviceTypes.length).toBeGreaterThanOrEqual(2); // תמונות: 1, סרטונים: 1
    });
  });

  describe('UI Actions', () => {
    it('should open editor for new project', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      const addButton = screen.getByText('פרויקט חדש');
      await user.click(addButton);

      expect(screen.getByTestId('admin-portfolio-editor')).toBeInTheDocument();
      expect(screen.getByText('Editing: New Project')).toBeInTheDocument();
    });

    it('should open editor for existing project with fresh data', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-1');
      await user.click(editButton);

      // Should fetch fresh data
      expect(mockPortfolioStore.getProjects).toHaveBeenCalled();
      expect(screen.getByTestId('admin-portfolio-editor')).toBeInTheDocument();
    });

    it('should handle new project creation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      // Open editor for new project
      const addButton = screen.getByText('פרויקט חדש');
      await user.click(addButton);

      // Save project
      const saveButton = screen.getByTestId('save-project');
      await user.click(saveButton);

      expect(mockPortfolioStore.addProject).toHaveBeenCalledWith({
        businessName: 'Saved Project',
        businessType: 'מסעדה',
        serviceType: 'תמונות',
        imageAfter: 'saved.jpg',
        size: 'medium',
        category: 'restaurants'
      });
    });

    it('should handle existing project update', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      // Edit existing project
      const editButton = screen.getByTestId('edit-1');
      await user.click(editButton);

      // Save changes
      const saveButton = screen.getByTestId('save-project');
      await user.click(saveButton);

      expect(mockPortfolioStore.updateProject).toHaveBeenCalledWith('1', {
        id: '1',
        businessName: 'Saved Project',
        businessType: 'מסעדה',
        serviceType: 'תמונות',
        imageAfter: 'saved.jpg',
        size: 'medium',
        category: 'restaurants'
      });
    });
  });

  describe('Autosave Functionality', () => {
    it('should not trigger autosave for new projects (no id)', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      // Open editor for new project
      const addButton = screen.getByText('פרויקט חדש');
      await user.click(addButton);

      // Trigger autosave
      const autoSaveButton = screen.getByTestId('auto-save');
      await user.click(autoSaveButton);

      // Should not call updateProject for projects without id
      expect(mockPortfolioStore.updateProject).not.toHaveBeenCalled();
    });

    it('should trigger autosave for existing projects with id', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      // Edit existing project
      const editButton = screen.getByTestId('edit-1');
      await user.click(editButton);

      // Trigger autosave
      const autoSaveButton = screen.getByTestId('auto-save');
      await user.click(autoSaveButton);

      expect(mockPortfolioStore.updateProject).toHaveBeenCalledWith('1', {
        businessName: 'Auto Saved',
        businessType: 'מסעדה',
        serviceType: 'תמונות',
        imageAfter: 'auto-saved.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants'],
        pinned: undefined
      });
    });

    it('should handle autosave failures silently', async () => {
      mockPortfolioStore.updateProject.mockRejectedValue(new Error('Autosave failed'));
      const consoleSpy = vi.spyOn(console, 'warn');
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      // Edit existing project
      const editButton = screen.getByTestId('edit-1');
      await user.click(editButton);

      // Trigger autosave that will fail
      const autoSaveButton = screen.getByTestId('auto-save');
      await user.click(autoSaveButton);

      expect(consoleSpy).toHaveBeenCalledWith('Autosave failed:', expect.any(Error));
      // Editor should still be open (silent failure)
      expect(screen.getByTestId('admin-portfolio-editor')).toBeInTheDocument();
    });
  });

  describe('Project Management', () => {
    it('should delete project successfully', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-1');
      await user.click(deleteButton);

      expect(mockPortfolioStore.deleteProject).toHaveBeenCalledWith('1');
    });

    it('should duplicate project with modified title', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('duplicate-1')).toBeInTheDocument();
      });

      const duplicateButton = screen.getByTestId('duplicate-1');
      await user.click(duplicateButton);

      expect(mockPortfolioStore.addProject).toHaveBeenCalledWith({
        businessName: 'Test Restaurant - עותק',
        businessType: 'מסעדה',
        serviceType: 'תמונות',
        imageAfter: 'after1.jpg',
        imageBefore: 'before1.jpg',
        size: 'medium',
        category: 'restaurants',
        tags: ['restaurants'],
        pinned: false,
        createdAt: '2024-01-01T10:00:00Z'
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should reload data when PORTFOLIO_UPDATE_EVENT fires', async () => {
      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      // Clear initial calls
      mockPortfolioStore.getProjects.mockClear();
      mockPortfolioStore.getStats.mockClear();

      // Fire update event
      window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATE_EVENT));

      await waitFor(() => {
        expect(mockPortfolioStore.getProjects).toHaveBeenCalled();
        expect(mockPortfolioStore.getStats).toHaveBeenCalled();
      });
    });

    it('should handle showToast events', async () => {
      const { useToast } = await import('@/hooks/use-toast');
      const mockToast = vi.fn();
      vi.mocked(useToast).mockReturnValue({ 
        toast: mockToast,
        dismiss: vi.fn(),
        toasts: []
      });

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      // Fire toast event
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { type: 'success', message: 'Test message' }
      }));

      expect(mockToast).toHaveBeenCalledWith({
        title: 'הצלחה',
        description: 'Test message',
        variant: 'default'
      });
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(PORTFOLIO_UPDATE_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('showToast', expect.any(Function));
    });
  });

  describe('Import/Export', () => {
    it('should export config', async () => {
      const mockConfig = { items: mockProjects };
      mockPortfolioStore.exportConfig.mockReturnValue(mockConfig);

      // Mock DOM API
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      mockCreateElement.mockReturnValue(mockLink as any);

      const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
      mockCreateObjectURL.mockReturnValue('mock-url');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      const exportButton = screen.getByText('יצוא');
      await user.click(exportButton);

      expect(mockPortfolioStore.exportConfig).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle successful import', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      const file = new File(['{\\\"projects\\\": []}'], 'test.json', {
        type: 'application/json'
      });

      // Mock FileReader
      const mockReader = {
        readAsText: vi.fn(),
        result: '{\\\"projects\\\": []}',
        onload: null as any
      };
      global.FileReader = vi.fn(() => mockReader) as any;

      // Find file input and simulate change
      const fileInput = document.querySelector('input[type=\\\"file\\\"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });

      fireEvent.change(fileInput);

      // Trigger FileReader onload
      mockReader.onload?.({ target: { result: '{\\\"projects\\\": []}' } });

      expect(mockPortfolioStore.importConfig).toHaveBeenCalledWith({ items: [] });
    });

    it('should handle load mock data', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      const loadMockButton = screen.getByText('טען נתוני דמו');
      await user.click(loadMockButton);

      expect(mockPortfolioStore.setProjects).toHaveBeenCalled();
    });

    it('should handle reset', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      const resetButton = screen.getByText('נקה הכל');
      await user.click(resetButton);

      expect(mockPortfolioStore.reset).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle project save errors', async () => {
      mockPortfolioStore.updateProject.mockRejectedValue(new Error('Save failed'));
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-1');
      await user.click(editButton);

      const saveButton = screen.getByTestId('save-project');
      await user.click(saveButton);

      // Should handle error gracefully and keep editor open
      expect(screen.getByTestId('admin-portfolio-editor')).toBeInTheDocument();
    });

    it('should handle delete failures', async () => {
      mockPortfolioStore.deleteProject.mockResolvedValue(false);
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-1');
      await user.click(deleteButton);

      expect(mockPortfolioStore.deleteProject).toHaveBeenCalledWith('1');
      // Should show error toast (mocked)
    });

    it('should prevent double-submit on new project creation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      const addButton = screen.getByText('פרויקט חדש');
      await user.click(addButton);

      const saveButton = screen.getByTestId('save-project');
      
      // Double-click rapidly
      await user.click(saveButton);
      await user.click(saveButton);

      // Should only call addProject once
      expect(mockPortfolioStore.addProject).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility and UX', () => {
    it('should show "יש שינויים" badge when changes are made', async () => {
      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      // Initially no changes
      expect(screen.queryByText('יש שינויים')).not.toBeInTheDocument();

      // Make a change by opening editor
      const addButton = screen.getByText('פרויקט חדש');
      await userEvent.setup().click(addButton);

      // Trigger autosave to mark as changed
      const autoSaveButton = screen.getByTestId('auto-save');
      await userEvent.setup().click(autoSaveButton);

      expect(screen.getByText('יש שינויים')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      // Mock loading state
      vi.doMock('@/hooks/useSupabaseAuth', () => ({
        useSupabaseAuth: () => ({
          user: null,
          isLoading: true,
          isAdmin: false
        })
      }));

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      expect(screen.getByText('טוען...')).toBeInTheDocument();
    });

    it('should show access denied for non-admin users', () => {
      vi.doMock('@/hooks/useSupabaseAuth', () => ({
        useSupabaseAuth: () => ({
          user: { id: 'user', email: 'user@test.com' },
          isLoading: false,
          isAdmin: false
        })
      }));

      render(
        <TestWrapper>
          <AdminPortfolioPage />
        </TestWrapper>
      );

      expect(screen.getByText('נדרשת הרשאה')).toBeInTheDocument();
    });
  });
});
