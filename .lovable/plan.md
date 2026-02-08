

# Database Backup Restoration Plan

## What's in the Backup

The backup is a full PostgreSQL cluster dump from your previous Supabase project (`uvztokbjkaosjxnziizt.supabase.co`). Here's what it contains:

### Data Tables
1. **`dishes` table** -- ~130 food photography items with titles, image URLs, before/after URLs, keywords, display order, and featured flags
2. **`background_images` table** -- 3 hero background images
3. **`admin_users` table** -- 1 admin user (admin@food-vision.co.il)
4. **`landing_texts` table** -- empty (no data)

### Storage
- **`dishes` bucket** -- hundreds of uploaded food photos (JPG, PNG, WebP)
- **`backgrounds` bucket** -- hero background images

### Important Notes
- The old database used a `dishes` table; the new project uses a `projects` table (different schema)
- All image URLs point to the old project (`uvztokbjkaosjxnziizt.supabase.co`) -- these URLs are still accessible, so images will display correctly
- No testimonials, FAQ, categories, services, or site content data exists in the backup

---

## Restoration Plan

### Step 1: Create Admin User
Register the admin email (admin@food-vision.co.il) in the new authentication system, then add to `admin_users` table.

### Step 2: Migrate `dishes` to `projects`
Map the old columns to the new schema:

```text
OLD (dishes)              -->  NEW (projects)
----------------------------------------------
id                        -->  id
title                     -->  title
caption                   -->  description
img_full                  -->  image_after_url
img_thumb                 -->  image_after_thumb_url
before_url                -->  image_before_url
combined_before_after_url -->  (not mapped, optional)
is_featured               -->  is_featured
display_order             -->  order_index
keywords (array)          -->  category_ids (array)
created_at                -->  created_at
size (not in old)         -->  'medium' (default)
```

Write a SQL migration that:
- Inserts all ~130 dish records into `projects`
- Maps columns correctly
- Preserves original IDs and timestamps
- Only includes featured items (is_featured = true) to match your current display logic, or all items if preferred

### Step 3: Restore `background_images`
Insert the 3 background image records with their original URLs.

### Step 4: Image URL Strategy
The old Supabase images are still publicly accessible. Two options:
- **Option A (Recommended for now):** Keep using old URLs -- everything works immediately with zero effort
- **Option B (Future):** Create a background migration script that downloads each image from the old project and re-uploads to the new storage -- this is safer long-term but takes more work

---

## Technical Details

### SQL Migration
A single migration will:
1. Insert background images
2. Insert all dish data mapped to the `projects` table schema
3. The `keywords` array (e.g. `{mains, burgers}`) will map directly to `category_ids` since both are text arrays

### What Won't Be Restored
- Auth sessions and tokens (users need to re-register/login)
- Storage object metadata records (not needed since URLs still work)
- Realtime subscriptions
- Any Supabase internal schemas

### Risks
- If the old Supabase project is deleted or paused, all image URLs will break
- The old admin password won't transfer -- a new account needs to be created
