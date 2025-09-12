-- Task 2: Update RLS policies for consistent naming and public access
-- Drop existing policies and recreate with consistent names

DROP POLICY IF EXISTS "Public can read active categories" ON categories;
DROP POLICY IF EXISTS "Public can read active services" ON services;
DROP POLICY IF EXISTS "Public can read site content" ON site_content;
DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can read active FAQ" ON faq;
DROP POLICY IF EXISTS "Public can read projects" ON projects;

-- Create consistent public read access policies
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public read access" ON faq FOR SELECT USING (true);

-- Admin policies remain the same
-- CREATE POLICY "Admin full access" ON [table] FOR ALL USING (auth.role() = 'admin');
-- Will be defined when we create auth system

-- Task 4: Insert sample data for immediate testing

-- Sample categories
INSERT INTO categories (name, slug, description, order_index) VALUES
('מסעדות ובתי קפה', 'restaurants', 'תמונות מקצועיות למסעדות ובתי קפה', 1),
('מאפיות', 'bakeries', 'תמונות מושלמות למאפיות וקונדיטוריות', 2),
('קייטרינג', 'catering', 'תמונות לאירועים וקייטרינג', 3),
('מוצרי מזון', 'food-products', 'תמונות למוצרי מזון ומותגים', 4);

-- Sample site content
INSERT INTO site_content (key, value, description) VALUES
('hero_title', 'תמונות מושלמות', 'כותרת ראשית בעמוד הבית'),
('hero_subtitle', 'מהנו תוכן ויזואלי במקום אחד - אצלנו מוכן תוך יומיים, ובכ- 90% פחות', 'תת-כותרת בעמוד הבית'),
('hero_cta_primary', 'התחילו עכשיו', 'טקסט כפתור ראשי'),
('hero_cta_secondary', 'איך זה עובד', 'טקסט כפתור משני'),
('solutions_title', 'פתרונות מותאמים לכל עסק', 'כותרת חלק הפתרונות'),
('solutions_subtitle', 'מתמחים ביצירת תוכן ויזואלי מקצועי שמתאים בדיוק לטעמכם ולצרכים שלכם', 'תת-כותרת חלק הפתרונות');

-- Sample services
INSERT INTO services (name, description, cta_text, cta_link, order_index) VALUES
('צילום מזון מקצועי', 'תמונות איכותיות שממירות לקוחות למכירות', 'קבלו הצעת מחיר', 'https://wa.me/972527772807', 1),
('עיצוב תפריטים', 'תפריטים מעוצבים שמושכים עין ומגדילים מכירות', 'דברו איתנו', '/contact', 2);

-- Sample FAQ
INSERT INTO faq (question, answer, category, order_index) VALUES
('כמה זמן לוקח לקבל את התמונות?', 'בדרך כלל אנחנו מספקים את התמונות תוך 2-3 ימי עסקים', 'general', 1),
('איך אתם יוצרים תמונות כל כך מקצועיות?', 'אנחנו משתמשים בטכנולוגיה מתקדמת של בינה מלאכותית בשילוב מומחיות בעיצוב ויזואלי', 'general', 2),
('האם אפשר לבקש שינויים בתמונות?', 'כן, אנחנו מציעים עד 3 סיבובי עריכות כדי שהתוצר יהיה בדיוק כמו שחלמתם', 'general', 3);

-- Sample testimonials
INSERT INTO testimonials (client_name, client_business, content, rating, order_index) VALUES
('יוסי כהן', 'מסעדת הדג הזהב', 'התמונות שקיבלנו פשוט מדהימות! המכירות שלנו עלו ב-30% מאז שהתחלנו להשתמש בתמונות מ-Food Vision', 5, 1),
('רחל לוי', 'מאפיית שושנה', 'שירות מקצועי ומהיר. התמונות של החלות והעוגות שלנו נראות כמו במגזינים!', 5, 2);

-- Task 5: Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES
('project-images', 'project-images', true),
('category-icons', 'category-icons', true),
('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public read access
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('project-images', 'category-icons', 'service-images'));

-- Admin storage policies
CREATE POLICY "Admin full access to storage" ON storage.objects FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Enable realtime for all tables
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE categories REPLICA IDENTITY FULL;
ALTER TABLE services REPLICA IDENTITY FULL;
ALTER TABLE site_content REPLICA IDENTITY FULL;
ALTER TABLE testimonials REPLICA IDENTITY FULL;
ALTER TABLE faq REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE site_content;
ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
ALTER PUBLICATION supabase_realtime ADD TABLE faq;