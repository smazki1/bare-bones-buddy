import { supabase } from '@/integrations/supabase/client';
import { fetchActiveCategories } from './categoryUtils';

/**
 * Migrates projects from old category system to use proper category IDs
 * This ensures backwards compatibility and proper category relationships
 */
export async function migrateProjectCategories(): Promise<void> {
  try {
    console.log('Starting category migration...');
    
    // Get all active categories
    const categories = await fetchActiveCategories();
    const categorySlugToIdMap = new Map<string, string>();
    
    categories.forEach(category => {
      categorySlugToIdMap.set(category.slug, category.id);
    });
    
    // Get all projects that might need migration
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, category_ids, title');
      
    if (fetchError) {
      console.error('Error fetching projects for migration:', fetchError);
      return;
    }
    
    if (!projects || projects.length === 0) {
      console.log('No projects found for migration');
      return;
    }
    
    let migratedCount = 0;
    
    for (const project of projects) {
      let needsUpdate = false;
      let newCategoryIds = project.category_ids || [];
      
      // If no category_ids, try to infer from project title or assign default
      if (!newCategoryIds || newCategoryIds.length === 0) {
        // Default to restaurants category if it exists
        const restaurantsId = categorySlugToIdMap.get('restaurants');
        if (restaurantsId) {
          newCategoryIds = [restaurantsId];
          needsUpdate = true;
        }
      } else {
        // Validate existing category IDs and replace any invalid ones
        const validCategoryIds = newCategoryIds.filter(categoryId => {
          // Check if this ID exists in current categories
          return categories.some(cat => cat.id === categoryId);
        });
        
        if (validCategoryIds.length !== newCategoryIds.length) {
          // Some IDs were invalid, replace with valid ones or default
          if (validCategoryIds.length === 0) {
            const restaurantsId = categorySlugToIdMap.get('restaurants');
            newCategoryIds = restaurantsId ? [restaurantsId] : [];
          } else {
            newCategoryIds = validCategoryIds;
          }
          needsUpdate = true;
        }
      }
      
      if (needsUpdate && newCategoryIds.length > 0) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ category_ids: newCategoryIds })
          .eq('id', project.id);
          
        if (updateError) {
          console.error(`Error updating project ${project.id}:`, updateError);
        } else {
          migratedCount++;
          console.log(`Migrated project "${project.title}" to categories:`, newCategoryIds);
        }
      }
    }
    
    console.log(`Category migration completed. Updated ${migratedCount} projects.`);
    
    // Trigger portfolio refresh if any projects were updated
    if (migratedCount > 0) {
      window.dispatchEvent(new CustomEvent('categories:updated'));
    }
    
  } catch (error) {
    console.error('Error during category migration:', error);
  }
}

/**
 * Checks if categories exist in the database, creates default ones if needed
 */
export async function ensureDefaultCategories(): Promise<void> {
  try {
    const categories = await fetchActiveCategories();
    
    if (categories.length === 0) {
      console.log('No categories found, creating default categories...');
      
      const defaultCategories = [
        {
          name: 'מסעדות',
          slug: 'restaurants',
          description: 'תמונות למסעדות ובתי קפה',
          order_index: 0,
          is_active: true
        },
        {
          name: 'מאפיות',
          slug: 'bakeries',
          description: 'תמונות למאפיות וקונדיטוריות',
          order_index: 1,
          is_active: true
        },
        {
          name: 'אוכל מהיר',
          slug: 'fast-food',
          description: 'תמונות לאוכל מהיר',
          order_index: 2,
          is_active: true
        },
        {
          name: 'קייטרינג',
          slug: 'catering',
          description: 'תמונות לחברות קייטרינג ואירועים',
          order_index: 3,
          is_active: true
        }
      ];
      
      const { error } = await supabase
        .from('categories')
        .insert(defaultCategories);
        
      if (error) {
        console.error('Error creating default categories:', error);
      } else {
        console.log('Default categories created successfully');
        window.dispatchEvent(new CustomEvent('categories:updated'));
      }
    }
  } catch (error) {
    console.error('Error ensuring default categories:', error);
  }
}

/**
 * Runs full migration process - ensures categories exist and migrates projects
 */
export async function runCategoryMigration(): Promise<void> {
  try {
    console.log('Running full category migration...');
    
    // First ensure default categories exist
    await ensureDefaultCategories();
    
    // Then migrate projects to use proper category IDs
    await migrateProjectCategories();
    
    console.log('Full category migration completed');
  } catch (error) {
    console.error('Error in full category migration:', error);
  }
}