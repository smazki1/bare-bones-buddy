import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VisualSolutionsConfig, VisualSolutionCard } from '@/types/visualSolutions';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';
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

  const handleClick = useCallback(() => {
    navigate('/services');
  }, [navigate]);

  const CardContent = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer h-full"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-300 group-hover:scale-[1.02] aspect-[4/3] w-full">
        {solution.videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="text-lg md:text-xl lg:text-2xl font-assistant font-bold mb-2 line-clamp-2">
            {solution.title}
          </h3>
        </div>
      </div>
    </motion.div>
  ), [solution, index, isVisible, handleClick]);

  return (
    <div ref={setCardRef}>
      {CardContent}
    </div>
  );
};

const VisualSolutionsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const [config, setConfig] = useState<VisualSolutionsConfig>(() => 
    visualSolutionsStore.safeGetConfigOrDefaults()
  );

  // Carousel refs and state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Responsive breakpoints
  const getCardsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  }, []);

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView);

  // Update cards per view on resize
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
      // Reset to first slide on resize to avoid layout issues
      setCurrentIndex(0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getCardsPerView]);

  // Force reload config and sync with Supabase on mount
  useEffect(() => {
    const loadLatestConfig = async () => {
      console.log('VisualSolutionsSection: Loading latest config...');
      
      try {
        // Always fetch from Supabase first for latest data
        const cloudConfig = await visualSolutionsStore.fetchFromSupabase();
        if (cloudConfig && cloudConfig.items && cloudConfig.items.length > 0) {
          console.log('VisualSolutionsSection: Loaded config from Supabase:', cloudConfig);
          setConfig(cloudConfig);
          return;
        }
        console.log('VisualSolutionsSection: No valid config from Supabase, trying localStorage');
      } catch (error) {
        console.warn('VisualSolutionsSection: Failed to fetch from Supabase:', error);
      }
      
      // Fallback to local storage
      const localConfig = visualSolutionsStore.safeGetConfigOrDefaults();
      console.log('VisualSolutionsSection: Loaded config from localStorage:', localConfig);
      setConfig(localConfig);
    };

    loadLatestConfig();

    // Listen for updates and always prefer cloud
    const reloadFromCloud = async () => {
      try {
        const cloud = await visualSolutionsStore.fetchFromSupabase();
        if (cloud) {
          setConfig(cloud);
          return;
        }
      } catch {}
      setConfig(visualSolutionsStore.safeGetConfigOrDefaults());
    };

    // Remove storage listener to avoid loops

    const handleLocalUpdate = () => {
      console.log('Local update event received, reloading from cloud');
      void reloadFromCloud();
    };
    window.addEventListener('visualSolutions:updated', handleLocalUpdate as EventListener);

    return () => {
      window.removeEventListener('visualSolutions:updated', handleLocalUpdate as EventListener);
    };
  }, []);

  const enabledSolutions = useMemo(() => {
    const filtered = config.items
      .filter(solution => solution.enabled)
      .sort((a, b) => a.order - b.order);
    
    console.log('Visual Solutions Debug:', {
      totalItems: config.items.length,
      enabledItems: filtered.length,
      items: filtered.map(item => ({ id: item.id, title: item.title, enabled: item.enabled }))
    });
    
    return filtered;
  }, [config.items]);

  const maxIndex = useMemo(() => {
    const totalSlides = Math.ceil(enabledSolutions.length / cardsPerView);
    return Math.max(0, totalSlides - 1);
  }, [enabledSolutions.length, cardsPerView]);

  // Smooth slide transition with hardware acceleration
  const slideToIndex = useCallback((index: number) => {
    if (isTransitioning || !carouselRef.current) return;
    
    const targetIndex = Math.max(0, Math.min(index, maxIndex));
    if (targetIndex === currentIndex) return;

    setIsTransitioning(true);
    setCurrentIndex(targetIndex);

      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        if (carouselRef.current) {
          const translateX = -(targetIndex * (100 / cardsPerView));
          carouselRef.current.style.transform = `translate3d(${translateX}%, 0, 0)`;
        }
        
        // Reset transition state after animation
        setTimeout(() => setIsTransitioning(false), 300);
      });
  }, [currentIndex, maxIndex, cardsPerView, isTransitioning]);

  const scrollNext = useCallback(() => {
    slideToIndex(currentIndex + 1);
  }, [currentIndex, slideToIndex]);

  const scrollPrev = useCallback(() => {
    slideToIndex(currentIndex - 1);
  }, [currentIndex, slideToIndex]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      scrollNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      scrollPrev();
    }
  }, [touchStart, touchEnd, currentIndex, maxIndex, scrollNext, scrollPrev]);

  const canScrollNext = currentIndex < maxIndex;
  const canScrollPrev = currentIndex > 0;

  // Calculate dots for pagination
  const totalDots = Math.ceil(enabledSolutions.length / cardsPerView);

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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-assistant font-bold text-primary mb-4 leading-tight max-w-4xl mx-auto drop-shadow-none">
            {config.sectionTitle}
          </h2>
          {/* Subtitle intentionally removed per request */}
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          <div className="overflow-hidden">
            <div 
              ref={carouselRef}
              className="flex flex-nowrap transition-transform duration-300 ease-out will-change-transform"
              style={{ 
                transform: `translate3d(-${currentIndex * (100 / cardsPerView)}%, 0, 0)`,
                width: `${Math.ceil(enabledSolutions.length / cardsPerView) * 100}%`
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {enabledSolutions.map((solution, index) => (
                <div
                  key={solution.id}
                  className="flex-none flex-shrink-0"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div className="h-full p-3">
                    <VisualSolutionCardComponent
                      solution={solution}
                      index={index}
                      isIntersecting={isIntersecting}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {enabledSolutions.length > cardsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 ${
                  !canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
                } hidden md:flex`}
                onClick={scrollPrev}
                disabled={!canScrollPrev || isTransitioning}
                aria-label="הקלף הקודם"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 ${
                  !canScrollNext ? 'opacity-30 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
                } hidden md:flex`}
                onClick={scrollNext}
                disabled={!canScrollNext || isTransitioning}
                aria-label="הקלף הבא"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Dots indicator */}
        {totalDots > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalDots }, (_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                onClick={() => slideToIndex(index)}
                disabled={isTransitioning}
                aria-label={`עבור לקבוצת קלפים ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualSolutionsSection;