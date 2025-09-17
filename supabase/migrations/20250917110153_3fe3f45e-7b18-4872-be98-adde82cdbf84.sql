-- Fix empty slugs in categories table
UPDATE categories 
SET slug = 'category-' || extract(epoch from created_at)::text 
WHERE slug IS NULL OR slug = '' OR trim(slug) = '';

-- Add a check constraint to prevent empty slugs in the future
ALTER TABLE categories 
ADD CONSTRAINT categories_slug_not_empty 
CHECK (length(trim(slug)) > 0);