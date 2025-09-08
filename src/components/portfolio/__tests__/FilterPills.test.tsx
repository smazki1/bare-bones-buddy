import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPills from '../FilterPills';

// Mock dependencies
vi.mock('@/utils/tagUtils', () => ({
  getAvailableTags: vi.fn(() => [
    { label: 'הכל', slug: 'all' },
    { label: 'מסעדות', slug: 'restaurants' },
    { label: 'מאפיות', slug: 'bakeries' },
    { label: 'קפה ומשקאות', slug: 'cafes' },
  ]),
}));

describe('FilterPills', () => {
  const mockOnFilterChange = vi.fn();

  const defaultProps = {
    activeFilter: 'all',
    onFilterChange: mockOnFilterChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all available filter pills', () => {
      render(<FilterPills {...defaultProps} />);

      expect(screen.getByText('הכל')).toBeInTheDocument();
      expect(screen.getByText('מסעדות')).toBeInTheDocument();
      expect(screen.getByText('מאפיות')).toBeInTheDocument();
      expect(screen.getByText('קפה ומשקאות')).toBeInTheDocument();
    });

    it('should highlight active filter', () => {
      render(<FilterPills {...defaultProps} activeFilter="restaurants" />);

      const restaurantsButton = screen.getByText('מסעדות');
      const allButton = screen.getByText('הכל');

      expect(restaurantsButton.closest('button')).toHaveClass('bg-primary');
      expect(allButton.closest('button')).not.toHaveClass('bg-primary');
    });

    it('should have correct accessibility attributes', () => {
      render(<FilterPills {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Interaction', () => {
    it('should call onFilterChange when filter is clicked', async () => {
      const user = userEvent.setup();
      render(<FilterPills {...defaultProps} />);

      const restaurantsButton = screen.getByText('מסעדות');
      await user.click(restaurantsButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('restaurants');
    });

    it('should allow clicking same filter multiple times', async () => {
      const user = userEvent.setup();
      render(<FilterPills {...defaultProps} activeFilter="restaurants" />);

      const restaurantsButton = screen.getByText('מסעדות');
      await user.click(restaurantsButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('restaurants');
    });

    it('should handle filter changes correctly', async () => {
      const user = userEvent.setup();
      render(<FilterPills {...defaultProps} />);

      // Click different filters
      await user.click(screen.getByText('מאפיות'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('bakeries');

      await user.click(screen.getByText('קפה ומשקאות'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('cafes');

      await user.click(screen.getByText('הכל'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Dynamic Tag Updates', () => {
    it('should update when available tags change', () => {
      const { getAvailableTags } = require('@/utils/tagUtils');
      
      // Initially render with default tags
      const { rerender } = render(<FilterPills {...defaultProps} />);
      expect(screen.getByText('מסעדות')).toBeInTheDocument();

      // Change available tags
      getAvailableTags.mockReturnValue([
        { label: 'הכל', slug: 'all' },
        { label: 'מסעדות חדשות', slug: 'new-restaurants' },
        { label: 'בתי קפה', slug: 'coffee-shops' },
      ]);

      // Trigger re-render
      rerender(<FilterPills {...defaultProps} />);

      expect(screen.getByText('מסעדות חדשות')).toBeInTheDocument();
      expect(screen.getByText('בתי קפה')).toBeInTheDocument();
      expect(screen.queryByText('מאפיות')).not.toBeInTheDocument();
    });

    it('should handle solutions update events', () => {
      const { getAvailableTags } = require('@/utils/tagUtils');
      
      render(<FilterPills {...defaultProps} />);

      // Change available tags
      getAvailableTags.mockReturnValue([
        { label: 'הכל', slug: 'all' },
        { label: 'תגית חדשה', slug: 'new-tag' },
      ]);

      // Simulate solutions update event
      fireEvent(window, new Event('solutions:updated'));

      expect(screen.getByText('תגית חדשה')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tags gracefully', () => {
      const { getAvailableTags } = require('@/utils/tagUtils');
      getAvailableTags.mockReturnValue([]);

      render(<FilterPills {...defaultProps} />);

      // Should still render container
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('should handle invalid activeFilter', () => {
      render(<FilterPills {...defaultProps} activeFilter="nonexistent" />);

      // Should render without errors
      const allButton = screen.getByText('הכל');
      expect(allButton.closest('button')).not.toHaveClass('bg-primary');
    });

    it('should handle tags with special characters', () => {
      const { getAvailableTags } = require('@/utils/tagUtils');
      getAvailableTags.mockReturnValue([
        { label: 'הכل', slug: 'all' },
        { label: 'מסעדות & בתי קפה', slug: 'restaurants-cafes' },
        { label: 'מאפיות 24/7', slug: 'bakeries-24-7' },
      ]);

      render(<FilterPills {...defaultProps} />);

      expect(screen.getByText('מסעדות & בתי קפה')).toBeInTheDocument();
      expect(screen.getByText('מאפיות 24/7')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { getAvailableTags } = require('@/utils/tagUtils');
      let callCount = 0;
      
      getAvailableTags.mockImplementation(() => {
        callCount++;
        return [
          { label: 'הכל', slug: 'all' },
          { label: 'מסעדות', slug: 'restaurants' },
        ];
      });

      const { rerender } = render(<FilterPills {...defaultProps} />);
      const initialCallCount = callCount;

      // Re-render with same props
      rerender(<FilterPills {...defaultProps} />);

      // Should not call getAvailableTags again if tags haven't changed
      expect(callCount).toBe(initialCallCount);
    });
  });
});