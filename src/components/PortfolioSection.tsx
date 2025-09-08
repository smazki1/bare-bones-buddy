import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Button } from './ui/button';
import { fetchProjects } from '@/lib/supabase';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  tags: string[];
}

const PortfolioSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [usingRealData, setUsingRealData] = useState(false);

  // Mock data generator
  const generatePortfolioItems = (pageNum: number) => {
    const baseImages = [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    ];

    const categories = ['מסעדות', 'מאפיות', 'אוכל מהיר', 'ספקי מזון'];
    const dishes = ['פסטה', 'המבורגר', 'פיצה', 'סלט', 'דג', 'בשר', 'קינוח', 'חלה'];

    return Array.from({ length: 15 }, (_, index) => {
      const globalIndex = (pageNum - 1) * 15 + index;
      return {
        id: globalIndex + 1,
        title: `${dishes[globalIndex % dishes.length]} מושלם`,
        category: categories[globalIndex % categories.length],
        image: baseImages[globalIndex % baseImages.length],
        tags: ['AI מותאם', 'איכות גבוהה', 'מקצועי'],
      };
    });
  };

  const fetchNextPage = async () => {
    if (isFetching) return;
    if (usingRealData) return; // disable infinite scroll when using real data
    
    setIsFetching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItems = generatePortfolioItems(page + 1);
    setPortfolioItems(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
    
    // Stop infinite scroll after 5 pages
    if (page >= 5) {
      setHasNextPage(false);
    }
    
    setIsFetching(false);
  };

  useInfiniteScroll({ hasNextPage, fetchNextPage, isFetching });

  useEffect(() => {
    // Load ONLY real projects from Supabase; never show mock
    (async () => {
      try {
        const projects = await fetchProjects();
        const mapped: PortfolioItem[] = (projects || []).slice(0, 12).map((p) => ({
            id: p.id,
            title: p.business_name,
            category: p.category,
            image: p.image_after,
            tags: [],
          }));
        setPortfolioItems(mapped);
        setUsingRealData(true);
        setHasNextPage(false);
        return;
      } catch (e) {
        // keep empty; do not fallback to mock
      }
      setPortfolioItems([]);
      setUsingRealData(false);
    })();
  }, []);

  // Build srcset for Unsplash images (small perf boost on mobile)
  const buildUnsplashSrcSet = (url: string): string | undefined => {
    try {
      const parsed = new URL(url);
      if (!parsed.host.includes('images.unsplash.com')) return undefined;
      const widths = [300, 480, 600, 900];
      return widths
        .map((w) => {
          const u = new URL(parsed.toString());
          u.searchParams.set('w', String(w));
          u.searchParams.set('q', '80');
          if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
          if (!u.searchParams.has('fit')) u.searchParams.set('fit', 'crop');
          return `${u.toString()} ${w}w`;
        })
        .join(', ');
    } catch {
      return undefined;
    }
  };
  const sizesAttr = '(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 200px';

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
            תיק העבודות שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            עיין בתמונות AI מקצועיות שיצרנו עבור מסעדות ועסקי מזון
          </p>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index % 15) * 0.1 }}
              className="group cursor-pointer w-full max-w-[150px] md:max-w-[280px]"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105">
                <div className="aspect-[4/5] relative w-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    srcSet={buildUnsplashSrcSet(item.image)}
                    sizes={sizesAttr}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <h3 className="text-sm md:text-lg font-assistant font-bold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/90 font-open-sans text-xs md:text-sm">
                      {item.category}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Indicator */}
        {isFetching && (
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* End Message */}
        {!hasNextPage && portfolioItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground font-open-sans">
              זה הכל לעכשיו! צור קשר כדי לראות עוד דוגמאות
            </p>
            <Button className="mt-4 bg-secondary hover:bg-secondary/90 font-assistant">
              צור קשר לעוד דוגמאות
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;