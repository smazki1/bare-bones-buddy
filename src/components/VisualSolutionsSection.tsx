import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VisualSolutionsConfig, VisualSolutionCard } from '@/types/visualSolutions';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';

interface VisualSolutionCardProps {
  solution: VisualSolutionCard;
  index: number;
  isIntersecting: boolean;
}

const VisualSolutionCardComponent = ({ solution, index, isIntersecting }: VisualSolutionCardProps) => {
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!cardRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef);
    return () => observer.disconnect();
  }, [cardRef]);

  const handleClick = () => {
    if (solution.href) {
      // Navigation will be handled by Link component
      return;
    }
  };

  const CardContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105 aspect-[4/3]">
        {solution.videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
            <source src={solution.videoSrc} type="video/mp4" />
            <img
              src={solution.imageSrc}
              alt={solution.title}
              className="w-full h-full object-cover"
            />
          </video>
        ) : (
          <img
            src={solution.imageSrc}
            alt={solution.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="text-xl md:text-2xl font-assistant font-bold mb-2">
            {solution.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );

  if (solution.href) {
    return (
      <div ref={setCardRef}>
        <Link to={solution.href}>
          <CardContent />
        </Link>
      </div>
    );
  }

  return (
    <div ref={setCardRef}>
      <CardContent />
    </div>
  );
};

const VisualSolutionsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const [config, setConfig] = useState<VisualSolutionsConfig>(() => 
    visualSolutionsStore.safeGetConfigOrDefaults()
  );

  useEffect(() => {
    const loadConfig = () => {
      const newConfig = visualSolutionsStore.safeGetConfigOrDefaults();
      setConfig(newConfig);
    };

    loadConfig();

    // Listen for storage events to update config when admin changes it
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aiMaster:visualSolutions') {
        loadConfig();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const enabledSolutions = config.items
    .filter(solution => solution.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section ref={ref} className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            {config.sectionTitle}
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            {config.sectionSubtitle}
          </p>
        </motion.div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {enabledSolutions.slice(0, 6).map((solution, index) => (
              <VisualSolutionCardComponent
                key={solution.id}
                solution={solution}
                index={index}
                isIntersecting={isIntersecting}
              />
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Horizontal Scroll */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {enabledSolutions.map((solution, index) => (
              <div key={solution.id} className="flex-shrink-0 w-80">
                <VisualSolutionCardComponent
                  solution={solution}
                  index={index}
                  isIntersecting={isIntersecting}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualSolutionsSection;