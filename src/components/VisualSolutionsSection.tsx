import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
    // Navigate to services page
    navigate('/services');
  };

  const CardContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105 aspect-[3/2]">
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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent group-hover:from-black/60 transition-all duration-500" />
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="text-xl md:text-2xl font-assistant font-bold mb-2">
            {solution.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );

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
      console.log('Loading visual solutions config:', newConfig);
      setConfig(newConfig);
    };

    // Cloud-first load with fallback
    let didSetFromCloud = false;
    (async () => {
      try {
        const cloud = await visualSolutionsStore.fetchFromSupabase();
        if (cloud) {
          setConfig(cloud);
          didSetFromCloud = true;
        }
      } catch {}
      if (!didSetFromCloud) loadConfig();
    })();

    // Cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage change detected:', e.key);
      if (e.key === 'aiMaster:visualSolutions') {
        console.log('Visual solutions storage updated');
        loadConfig();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Same-tab updates
    const handleLocalUpdate = (e: CustomEvent) => {
      console.log('Visual solutions update event received:', e.detail);
      loadConfig();
    };
    window.addEventListener('visualSolutions:updated', handleLocalUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visualSolutions:updated', handleLocalUpdate as EventListener);
    };
  }, []);

  const enabledSolutions = config.items
    .filter(solution => solution.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section ref={ref} className="py-20 bg-muted/30 relative">
      {/* Seamless transition gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-muted/30" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-assistant font-bold text-primary mb-4 leading-tight max-w-4xl mx-auto">
            {config.sectionTitle}
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            {config.sectionSubtitle}
          </p>
        </motion.div>

        {/* Unified Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
    </section>
  );
};

export default VisualSolutionsSection;