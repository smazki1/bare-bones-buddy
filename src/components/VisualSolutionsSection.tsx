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

  // Simple carousel state
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Responsive cards per view
  const getCardsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    const width = window.innerWidth;
    if (width < 640) return 1; // mobile
    if (width < 1024) return 2; // tablet
    return 3; // desktop
  }, []);

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView);

  // Update on resize
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
      setCurrentPage(0); // Reset to first page
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getCardsPerView]);

  // Load config from Supabase
  useEffect(() => {
    const loadLatestConfig = async () => {
      try {
        const cloudConfig = await visualSolutionsStore.fetchFromSupabase();
        if (cloudConfig && cloudConfig.items && cloudConfig.items.length > 0) {
          setConfig(cloudConfig);
          return;
        }
      } catch (error) {
        console.warn('Failed to fetch from Supabase:', error);
      }
      
      const localConfig = visualSolutionsStore.safeGetConfigOrDefaults();
      setConfig(localConfig);
    };

    loadLatestConfig();

    const handleLocalUpdate = async () => {
      try {
        const cloud = await visualSolutionsStore.fetchFromSupabase();
        if (cloud) {
          setConfig(cloud);
          return;
        }
      } catch {}
      setConfig(visualSolutionsStore.safeGetConfigOrDefaults());
    };

    window.addEventListener('visualSolutions:updated', handleLocalUpdate as EventListener);
    return () => {
      window.removeEventListener('visualSolutions:updated', handleLocalUpdate as EventListener);
    };
  }, []);

  // Get enabled solutions
  const enabledSolutions = useMemo(() => {
    const filtered = config.items
      .filter(solution => solution.enabled)
      .sort((a, b) => a.order - b.order);
    
    console.log('Enabled Solutions:', {
      total: config.items.length,
      enabled: filtered.length,
      cardsPerView,
      titles: filtered.map(s => s.title)
    });
    
    return filtered;
  }, [config.items, cardsPerView]);

  // Calculate total pages
  const totalPages = Math.ceil(enabledSolutions.length / cardsPerView);
  const maxPage = totalPages - 1;

  // Navigation functions
  const goToPage = useCallback((pageIndex: number) => {
    if (isTransitioning || !carouselRef.current) return;
    
    const targetPage = Math.max(0, Math.min(pageIndex, maxPage));
    if (targetPage === currentPage) return;

    setIsTransitioning(true);
    setCurrentPage(targetPage);

    // Apply transform
    const translateX = -(targetPage * 100);
    carouselRef.current.style.transform = `translate3d(${translateX}%, 0, 0)`;
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentPage, maxPage, isTransitioning]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Touch handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

    if (isLeftSwipe && currentPage < maxPage) {
      nextPage();
    }
    if (isRightSwipe && currentPage > 0) {
      prevPage();
    }
  }, [touchStart, touchEnd, currentPage, maxPage, nextPage, prevPage]);

  // Debug info
  console.log('Carousel State:', {
    enabledSolutions: enabledSolutions.length,
    cardsPerView,
    totalPages,
    currentPage,
    maxPage
  });

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
              className="flex transition-transform duration-300 ease-out"
              style={{ 
                width: `${totalPages * 100}%`,
                transform: `translate3d(-${currentPage * 100}%, 0, 0)`
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Create pages */}
              {Array.from({ length: totalPages }, (_, pageIndex) => (
                <div
                  key={`page-${pageIndex}`}
                  className="flex"
                  style={{ width: `${100 / totalPages}%` }}
                >
                  {/* Cards for this page */}
                  {enabledSolutions
                    .slice(pageIndex * cardsPerView, (pageIndex + 1) * cardsPerView)
                    .map((solution, cardIndex) => (
                      <div
                        key={solution.id}
                        className="flex-1 p-3"
                        style={{ width: `${100 / cardsPerView}%` }}
                      >
                        <VisualSolutionCardComponent
                          solution={solution}
                          index={pageIndex * cardsPerView + cardIndex}
                          isIntersecting={isIntersecting}
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 ${
                  currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
                } hidden md:flex`}
                onClick={prevPage}
                disabled={currentPage === 0 || isTransitioning}
                aria-label="הקלף הקודם"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 ${
                  currentPage === maxPage ? 'opacity-30 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
                } hidden md:flex`}
                onClick={nextPage}
                disabled={currentPage === maxPage || isTransitioning}
                aria-label="הקלף הבא"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Dots indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                onClick={() => goToPage(index)}
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