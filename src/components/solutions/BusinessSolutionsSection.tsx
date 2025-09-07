import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { solutionsStore } from '@/data/solutionsStore';
import { SolutionsConfig, SolutionCard } from '@/types/solutions';



const BusinessSolutionsCard = ({ item, index }: { item: SolutionCard; index: number }) => {

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
  const [config, setConfig] = useState<SolutionsConfig>(() => 
    solutionsStore.safeGetConfigOrDefaults()
  );

  useEffect(() => {
    const updateConfig = () => {
      const newConfig = solutionsStore.safeGetConfigOrDefaults();
      console.log('BusinessSolutions: Loading config with', newConfig.items.length, 'total items');
      setConfig(newConfig);
    };

    updateConfig();

    const handleSaveFailed = () => {
      console.warn('BusinessSolutions: save_failed event received');
    };

    // Cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aiMaster:solutions') updateConfig();
    };
    window.addEventListener('storage', handleStorageChange);

    // Same-tab updates from admin actions
    const handleLocalUpdate = () => updateConfig();
    window.addEventListener('solutions:updated', handleLocalUpdate as EventListener);
    window.addEventListener('solutions:save_failed', handleSaveFailed as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('solutions:updated', handleLocalUpdate as EventListener);
      window.removeEventListener('solutions:save_failed', handleSaveFailed as EventListener);
    };
  }, []);

  // Guard: ensure items array is safe to iterate
  const items = Array.isArray(config?.items) ? config.items : [];
  
  const enabledSolutions = items.filter(item => item.enabled).sort((a, b) => a.order - b.order);
  
  console.log('BusinessSolutions: Rendering', enabledSolutions.length, 'enabled solutions out of', items.length, 'total items');

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
            {config.sectionTitle}
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground font-open-sans leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {config.sectionSubtitle}
          </motion.p>
        </div>

        {/* Grid - Desktop */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {enabledSolutions.map((item, index) => (
            <BusinessSolutionsCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Horizontal Scroll - Mobile/Tablet */}
        <div 
          className="lg:hidden relative"
          aria-label="פתרונות עסקיים - גלילה אופקית"
        >
          {/* Edge fade mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 -mx-4">
            {enabledSolutions.map((item, index) => (
              <div key={item.id} className="snap-center">
                <BusinessSolutionsCard item={item} index={index} />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          {enabledSolutions.length > 0 && (
            <div className="flex justify-center mt-6 gap-2">
              {enabledSolutions.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/30"
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BusinessSolutionsSection;