import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchActiveCategories, transformCategoriesToSolutions } from '@/utils/categoryUtils';
import { CategoryForBusinessSolutions } from '@/types/categories';
import { runCategoryMigration } from '@/utils/categoryMigration';



const BusinessSolutionsCard = ({ item, index }: { item: CategoryForBusinessSolutions; index: number }) => {

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: window.innerWidth >= 768 ? 12 : 0 
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const CardContent = () => (
    <div
      className="group relative aspect-[16/11] rounded-2xl overflow-hidden shadow-soft cursor-pointer transform transition-transform duration-200 hover:scale-105 min-w-[280px] md:min-w-0"
    >
      {/* Background Media */}
      {item.videoSrc ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={item.imageSrc || '/placeholder.svg'}
        >
          <source src={item.videoSrc} type="video/mp4" />
          {/* Fallback image if video fails */}
          <img src={item.imageSrc || '/placeholder.svg'} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        </video>
      ) : (
        <img
          src={item.imageSrc || '/placeholder.svg'}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-200" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white font-assistant font-bold text-xl leading-tight drop-shadow-lg">
          {item.title}
        </h3>
      </div>
    </div>
  );

  // Generate href at render time - prioritize custom href over auto-generated
  const href = item.href || (item.tagSlug ? `/portfolio?tag=${item.tagSlug}` : '');
  
  // If no link should be generated, render as non-clickable
  if (!href) {
    return (
      <div 
        className="cursor-default"
        aria-disabled="true"
      >
        <CardContent />
      </div>
    );
  }

  return (
    <Link 
      to={href}
      className="block"
      aria-label={`פתיחת קטלוג מסונן: ${item.title}`}
    >
      <CardContent />
    </Link>
  );
};

const BusinessSolutionsSection = () => {
  const [categories, setCategories] = useState<CategoryForBusinessSolutions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Run migration first to ensure data consistency
        await runCategoryMigration();
        
        const dbCategories = await fetchActiveCategories();
        const transformedCategories = transformCategoriesToSolutions(dbCategories);
        setCategories(transformedCategories);
        console.log('BusinessSolutions: Loaded', transformedCategories.length, 'categories from database');
      } catch (error) {
        console.error('BusinessSolutions: Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    // Listen for category updates (when admin updates categories)
    const handleCategoryUpdate = () => {
      loadCategories();
    };

    window.addEventListener('categories:updated', handleCategoryUpdate as EventListener);

    return () => {
      window.removeEventListener('categories:updated', handleCategoryUpdate as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-assistant font-bold text-primary mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            פתרונות מותאמים לכל עסק
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground font-open-sans leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            גלה איך אנחנו מסייעים לעסקים שונים ליצור תמונות מקצועיות
          </motion.p>
        </div>

        {/* Grid - Desktop */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {categories.map((item, index) => (
            <BusinessSolutionsCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Horizontal Scroll - Mobile/Tablet */}
        <div 
          className="lg:hidden relative"
          dir="rtl"
          aria-label="פתרונות עסקיים - גלילה אופקית"
        >
          {/* Edge fade mask - adjusted for RTL */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 -mx-4">
            {categories.map((item, index) => (
              <div key={item.id} className="snap-center">
                <BusinessSolutionsCard item={item} index={index} />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          {categories.length > 0 && (
            <div className="flex justify-center mt-6 gap-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/30"
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">אין קטגוריות פעילות להצגה</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BusinessSolutionsSection;