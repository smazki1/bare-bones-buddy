import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VisualSolutionsConfig, VisualSolutionCard } from '@/types/visualSolutions';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

interface VisualSolutionCardProps {
  solution: VisualSolutionCard;
  index: number;
  isIntersecting: boolean;
}

const VisualSolutionCardComponent = ({ solution, index, isIntersecting }: VisualSolutionCardProps) => {
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
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

  // Ensure visibility when the section itself is intersecting (fallback for transformed pages)
  useEffect(() => {
    if (isIntersecting) {
      setIsVisible(true);
    }
  }, [isIntersecting]);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [embla, setEmbla] = useState<CarouselApi | null>(null);

  // Responsive cards per view
  const getCardsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    const width = window.innerWidth;
    console.log('Window width:', width);
    if (width < 640) return 1; // mobile
    if (width < 1024) return 2; // tablet
    return 3; // desktop
  }, []);

  const [cardsPerView, setCardsPerView] = useState(() => getCardsPerView());

  // Update on resize
  useEffect(() => {
    const handleResize = () => {
      const next = getCardsPerView();
      if (next !== cardsPerView) {
        console.log('Resize -> cardsPerView change:', { from: cardsPerView, to: next });
        setCardsPerView(next);
      }
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w && w !== pageWidth) setPageWidth(w);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getCardsPerView, cardsPerView, pageWidth]);

  // Observe container width for reliable page width on mount and layout changes
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      const w = Math.round(cr.width);
      if (w && w !== pageWidth) setPageWidth(w);
    });
    ro.observe(el);
    // Initial measure
    const initialW = el.clientWidth;
    if (initialW && initialW !== pageWidth) setPageWidth(initialW);
    return () => ro.disconnect();
  }, [pageWidth]);

  

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
  const totalPages = Math.max(1, Math.ceil(enabledSolutions.length / cardsPerView));
  const maxPage = totalPages - 1;

  // Clamp currentPage if totalPages shrinks (run after totalPages is defined)
  useEffect(() => {
    const newMax = Math.max(0, totalPages - 1);
    if (currentPage > newMax) {
      setCurrentPage(newMax);
    }
  }, [totalPages, currentPage]);

  // Navigation functions
  const goToPage = useCallback((pageIndex: number) => {
    if (isTransitioning) return;
    
    const targetPage = Math.max(0, Math.min(pageIndex, maxPage));
    if (targetPage === currentPage) return;

    console.log('goToPage ->', { pageIndex, targetPage, currentPage, totalPages, cardsPerView });
    setIsTransitioning(true);
    setCurrentPage(targetPage);
    // If embla exists, scroll via API
    if (embla) embla.scrollTo(targetPage);
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentPage, maxPage, isTransitioning, totalPages, cardsPerView, embla]);

  // Sync currentPage with Embla selection for reliable indicator and content
  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      try {
        const snap = embla.selectedScrollSnap();
        if (typeof snap === 'number' && snap !== currentPage) {
          setCurrentPage(snap);
        }
      } catch {}
    };
    onSelect();
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onSelect);
    };
  }, [embla]);

  // Scroll container to current page (more reliable across devices)
  useEffect(() => {
    if (!containerRef.current) return;
    const w = pageWidth || containerRef.current.clientWidth || 0;
    if (!w) return;
    containerRef.current.scrollTo({ left: currentPage * w, behavior: 'smooth' });
  }, [currentPage, pageWidth]);

  // Keep currentPage in sync with user-driven scroll (swipe/drag)
  const handleContainerScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = pageWidth || el.clientWidth || 0;
    if (!w) return;
    const page = Math.round(el.scrollLeft / w);
    if (page !== currentPage) setCurrentPage(page);
  }, [currentPage, pageWidth]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Touch handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const SWIPE_THRESHOLD = 25; // px

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = touchEnd ?? (e.changedTouches && e.changedTouches[0]?.clientX) ?? null;
    if (touchStart === null || endX === null) return;

    const distance = touchStart - endX;
    const isLeftSwipe = distance > SWIPE_THRESHOLD;
    const isRightSwipe = distance < -SWIPE_THRESHOLD;

    if (isLeftSwipe && currentPage < maxPage) {
      nextPage();
    } else if (isRightSwipe && currentPage > 0) {
      prevPage();
    }

    // reset for next gesture
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentPage, maxPage, nextPage, prevPage]);

  // Debug info
  console.log('Carousel State:', {
    enabledSolutions: enabledSolutions.length,
    cardsPerView,
    totalPages,
    currentPage,
    maxPage
  });
  try {
    console.log('Total pages being created:', totalPages);
    console.log('Cards per page:', cardsPerView);
    Array.from({ length: totalPages }, (_, pageIndex) => {
      const pageCards = enabledSolutions.slice(pageIndex * cardsPerView, (pageIndex + 1) * cardsPerView);
      console.log(`Page ${pageIndex}:`, pageCards.map(c => c.title));
    });
  } catch {}

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

        {/* Responsive Grid (no carousel) */}
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabledSolutions.map((solution, index) => (
              <div key={solution.id} className="p-3">
                <VisualSolutionCardComponent
                  solution={solution}
                  index={index}
                  isIntersecting={isIntersecting}
                />
              </div>
            ))}
          </div>
        </div>

        {/* No dots/navigation needed for grid */}
      </div>
    </section>
  );
};

export default VisualSolutionsSection;