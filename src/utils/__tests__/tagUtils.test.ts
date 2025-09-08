import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getAvailableTags, 
  getTagLabel, 
  isValidTag, 
  syncProjectTags 
} from '../tagUtils';
import { solutionsStore } from '@/data/solutionsStore';
import { categoryFilters } from '@/data/portfolioMock';

// Mock the solutions store
vi.mock('@/data/solutionsStore', () => ({
  solutionsStore: {
    safeGetConfigOrDefaults: vi.fn(),
  },
}));

describe('tagUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAvailableTags', () => {
    it('should return tags from solutions store with "all" option first', () => {
    const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle',
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
          { id: 'bakeries', title: 'מאפיות', enabled: true, order: 1 },
          { id: 'cafes', title: 'קפה ומשקאות', enabled: false, order: 2 },
        ]
      };

      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);

      const result = getAvailableTags();

      expect(result).toEqual([
        { label: 'הכל', slug: 'all' },
        { label: 'מסעדות', slug: 'restaurants' },
        { label: 'מאפיות', slug: 'bakeries' },
      ]);
    });

    it('should filter out disabled solutions', () => {
    const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle', 
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
          { id: 'disabled', title: 'לא פעיל', enabled: false, order: 1 },
        ]
      };

      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);

      const result = getAvailableTags();

      expect(result).toEqual([
        { label: 'הכל', slug: 'all' },
        { label: 'מסעדות', slug: 'restaurants' },
      ]);
    });

    it('should sort tags by order', () => {
      const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle',
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'third', title: 'שלישי', enabled: true, order: 2 },
          { id: 'first', title: 'ראשון', enabled: true, order: 0 },
          { id: 'second', title: 'שני', enabled: true, order: 1 },
        ]
      };

      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);

      const result = getAvailableTags();

      expect(result).toEqual([
        { label: 'הכל', slug: 'all' },
        { label: 'ראשון', slug: 'first' },
        { label: 'שני', slug: 'second' },
        { label: 'שלישי', slug: 'third' },
      ]);
    });

    it('should include legacy tags not in solutions', () => {
      const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle',
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
        ]
      };

      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);

      const result = getAvailableTags();
      
      // Should include legacy categories not in solutions
      const legacyTags = result.filter(tag => 
        tag.slug !== 'all' && 
        tag.slug !== 'restaurants'
      );
      
      expect(legacyTags.length).toBeGreaterThan(0);
      expect(legacyTags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ slug: 'bakeries' }),
          expect.objectContaining({ slug: 'bars' }),
        ])
      );
    });

    it('should fallback to category filters on error', () => {
      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockImplementation(() => {
        throw new Error('Store error');
      });

      const result = getAvailableTags();

      expect(result).toEqual(categoryFilters);
    });
  });

  describe('getTagLabel', () => {
    beforeEach(() => {
      const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle',
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
          { id: 'bakeries', title: 'מאפיות', enabled: true, order: 1 },
        ]
      };
      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);
    });

    it('should return correct label for existing tag', () => {
      const result = getTagLabel('restaurants');
      expect(result).toBe('מסעדות');
    });

    it('should return slug for non-existing tag', () => {
      const result = getTagLabel('nonexistent');
      expect(result).toBe('nonexistent');
    });

    it('should return "הכל" for "all" slug', () => {
      const result = getTagLabel('all');
      expect(result).toBe('הכל');
    });
  });

  describe('isValidTag', () => {
    beforeEach(() => {
      const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle',
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
          { id: 'bakeries', title: 'מאפיות', enabled: true, order: 1 },
        ]
      };
      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);
    });

    it('should return true for valid tags', () => {
      expect(isValidTag('all')).toBe(true);
      expect(isValidTag('restaurants')).toBe(true);
      expect(isValidTag('bakeries')).toBe(true);
    });

    it('should return false for invalid tags', () => {
      expect(isValidTag('nonexistent')).toBe(false);
      expect(isValidTag('')).toBe(false);
    });
  });

  describe('syncProjectTags', () => {
    beforeEach(() => {
      const mockSolutions = {
        sectionTitle: 'Test Solutions',
        sectionSubtitle: 'Test Subtitle',
        updatedAt: '2023-01-01T00:00:00Z',
        items: [
          { id: 'restaurants', title: 'מסעדות', enabled: true, order: 0 },
          { id: 'bakeries', title: 'מאפיות', enabled: true, order: 1 },
        ]
      };
      vi.mocked(solutionsStore.safeGetConfigOrDefaults).mockReturnValue(mockSolutions);
    });

    it('should filter out invalid tags', () => {
      const projectTags = ['restaurants', 'invalid', 'bakeries', 'nonexistent'];
      const result = syncProjectTags(projectTags);
      
      expect(result).toEqual(['restaurants', 'bakeries']);
    });

    it('should return fallback category when no valid tags', () => {
      const projectTags = ['invalid', 'nonexistent'];
      const result = syncProjectTags(projectTags, 'restaurants');
      
      expect(result).toEqual(['restaurants']);
    });

    it('should return first available tag when fallback is invalid', () => {
      const projectTags = ['invalid'];
      const result = syncProjectTags(projectTags, 'nonexistent');
      
      expect(result).toEqual(['restaurants']); // First available tag
    });

    it('should handle empty tags array', () => {
      const result = syncProjectTags([], 'bakeries');
      
      expect(result).toEqual(['bakeries']);
    });

    it('should handle undefined tags', () => {
      const result = syncProjectTags(undefined, 'restaurants');
      
      expect(result).toEqual(['restaurants']);
    });

    it('should preserve valid tags in order', () => {
      const projectTags = ['bakeries', 'restaurants'];
      const result = syncProjectTags(projectTags);
      
      expect(result).toEqual(['bakeries', 'restaurants']);
    });
  });
});