import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const galleryItems = [
  {
    id: 1,
    category: 'מסעדות',
    title: 'פסטה ברוטב עגבניות',
    before: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    after: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    service: 'בנק תמונות'
  },
  {
    id: 2,
    category: 'מאפיות',
    title: 'חלת שבת מסורתית',
    before: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    after: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    service: 'תפריט ויזואלי'
  },
  {
    id: 3,
    category: 'בתי קפה',
    title: 'קפה לאטה אמנותי',
    before: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    after: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    service: 'סרטונים'
  },
  {
    id: 4,
    category: 'אוכל מהיר',
    title: 'המבורגר עסיסי',
    before: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    after: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    service: 'קטלוג מוצרים'
  },
  {
    id: 5,
    category: 'קונדיטוריות',
    title: 'עוגת יום הולדת',
    before: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    after: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    service: 'פתרונות מותגים'
  },
  {
    id: 6,
    category: 'מעדניות',
    title: 'מגש סושי מפואר',
    before: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    after: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    service: 'תמונות לאתר'
  }
];

const categories = ['הכל', 'מסעדות', 'מאפיות', 'בתי קפה', 'אוכל מהיר', 'קונדיטוריות', 'מעדניות'];

const BeforeAfterGallery = () => {
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  const filteredItems = activeCategory === 'הכל' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section 
      ref={elementRef}
      className="py-20 bg-background"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-6">
            לפני ואחרי - התוצאות מדברות בעד עצמן
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            גלו את ההבדל הדרמטי שהטכנולוגיה שלנו יוצרת
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={`font-assistant ${
                activeCategory === category 
                  ? 'bg-primary hover:bg-primary/90 text-white' 
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-glow transition-shadow duration-300">
                {/* Before/After Images */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={item.before}
                    alt={`${item.title} - לפני`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      hoveredItem === item.id ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <img 
                    src={item.after}
                    alt={`${item.title} - אחרי`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Before/After Labels */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <Badge variant="secondary" className="text-white bg-black/50">
                      לפני
                    </Badge>
                    <Badge variant="secondary" className="text-white bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      אחרי
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Badge className="mb-2 bg-secondary">{item.service}</Badge>
                    <h3 className="text-xl font-assistant font-bold mb-1">{item.title}</h3>
                    <p className="text-sm font-open-sans opacity-90">{item.category}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-assistant font-bold text-primary mb-4">
              רוצים לראות איך המנות שלכם יראו?
            </h3>
            <p className="text-lg text-muted-foreground font-open-sans mb-6">
              שלחו לנו תמונה אחת ונראה לכם מה אנחנו יכולים לעשות איתה - חינם!
            </p>
            <Button 
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-assistant text-lg px-8 py-6"
            >
              קבל דוגמה חינם
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterGallery;