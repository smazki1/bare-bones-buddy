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
      className="group relative aspect-[3/2] rounded-2xl overflow-hidden shadow-elegant hover:shadow-warm cursor-pointer transform transition-all duration-500 hover:scale-105"
    >
      {/* Background Media */}
      {item.videoSrc ? (
        <video
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent group-hover:from-black/60 transition-all duration-500" />
      
      {/* Content */}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <h3 className="font-assistant font-bold text-xl md:text-2xl leading-tight drop-shadow-lg">
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
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="cursor-default"
        aria-disabled="true"
      >
        <CardContent />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link 
        to={href}
        className="block"
        aria-label={`פתיחת קטלוג מסונן: ${item.title}`}
      >
        <CardContent />
      </Link>
    </motion.div>
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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
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
            className="text-xl text-muted-foreground font-open-sans leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            גלה איך אנחנו מסייעים לעסקים שונים ליצור תמונות מקצועיות
          </motion.p>
        </div>

        {/* Unified Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((item, index) => (
            <BusinessSolutionsCard key={item.id} item={item} index={index} />
          ))}
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