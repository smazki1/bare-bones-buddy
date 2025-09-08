import { solutionsStore } from './solutionsStore';
import { DEFAULT_SOLUTIONS_CONFIG } from '@/types/solutions';

/**
 * Force synchronization of the solutions store with the updated categories
 * This ensures all components get the new tag structure immediately
 */
export const forceSolutionsSync = () => {
  // Save the updated default config to trigger synchronization
  const success = solutionsStore.saveConfig(DEFAULT_SOLUTIONS_CONFIG);
  
  if (success) {
    console.log('✅ Solutions synchronized with updated categories:', DEFAULT_SOLUTIONS_CONFIG.items.map(item => item.title));
    // Dispatch event to notify all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('solutions:updated'));
    }
  } else {
    console.warn('❌ Failed to synchronize solutions');
  }
  
  return success;
};

// Auto-sync on import to ensure immediate synchronization
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure all stores are initialized
  setTimeout(() => {
    console.log('🔄 Auto-syncing solutions with new categories...');
    forceSolutionsSync();
  }, 100);
}