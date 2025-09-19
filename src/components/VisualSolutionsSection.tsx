import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VisualSolutionsConfig, VisualSolutionCard } from '@/types/visualSolutions';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';

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
      className="group cursor-pointer h-full"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105 aspect-[4/3] h-full">
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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500" />
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="text-lg md:text-xl lg:text-2xl font-assistant font-bold mb-2 line-clamp-2">
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

  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: 'rtl',
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    breakpoints: {
      '(min-width: 768px)': { 
        slidesToScroll: 1,
        align: 'start'
      }
    }
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

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

        {/* Carousel Layout */}
        <div className="relative max-w-7xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 rtl:flex-row-reverse">
              {enabledSolutions.map((solution, index) => (
                <div
                  key={solution.id}
                  className="flex-none w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 min-w-0"
                >
                  <VisualSolutionCardComponent
                    solution={solution}
                    index={index}
                    isIntersecting={isIntersecting}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 ${
              !canScrollNext ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
            } hidden md:flex`}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="הקלף הבא"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 ${
              !canScrollPrev ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
            } hidden md:flex`}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="הקלף הקודם"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VisualSolutionsSection;