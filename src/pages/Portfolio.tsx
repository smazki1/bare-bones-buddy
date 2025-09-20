import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import FilterPills from '@/components/portfolio/FilterPills';
import MasonryGrid from '@/components/portfolio/MasonryGrid';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePortfolioStore } from '@/data/portfolioStore';

const ITEMS_PER_PAGE = 8;
const MAX_ITEMS_DISPLAY = 16;

const Portfolio = () => {
  const { projects, loading, fetchProjects } = usePortfolioStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(searchParams.get('tag') || 'all');
  const [visibleProjects, setVisibleProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const itemsPerPage = isMobile ? 4 : ITEMS_PER_PAGE;

  // Load projects from Supabase using Zustand store
  useEffect(() => {
    fetchProjects();
    
    // Listen for category updates and refresh projects
    const handleCategoryUpdate = () => {
      // Force refresh of projects when categories are updated
      fetchProjects();
    };
    
    window.addEventListener('categories:updated', handleCategoryUpdate);
    
    return () => {
      window.removeEventListener('categories:updated', handleCategoryUpdate);
    };
  }, [fetchProjects]);

  // Filter projects based on active filter
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') {
      return projects;
    }
    // Support both legacy single category and new multi-tags
    return projects.filter(project => 
      project.tags?.includes(activeFilter) || 
      project.businessName?.toLowerCase().includes(activeFilter.toLowerCase()) ||
      project.category === activeFilter
    );
  }, [activeFilter, projects]);

  // Check if there are more pages to load and haven't reached max display limit
  const hasReachedMaxItems = visibleProjects.length >= MAX_ITEMS_DISPLAY;
  const hasNextPage = currentPage * itemsPerPage < filteredProjects.length && !hasReachedMaxItems;

  // Load next page of projects
  const fetchNextPage = async () => {
    if (isLoading || !hasNextPage) return;
    
    setIsLoading(true);
    // No artificial delay - immediate loading
    
    // Calculate next batch, ensuring we don't exceed MAX_ITEMS_DISPLAY
    const nextItemsCount = Math.min(
      (currentPage + 1) * itemsPerPage,
      MAX_ITEMS_DISPLAY
    );
      
    const nextPageProjects = filteredProjects.slice(0, nextItemsCount);
      
    setVisibleProjects(nextPageProjects);
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  };

  // Manual loader
  const handleLoadMore = () => {
    void fetchNextPage();
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(2); // Start from page 2 since we load double initially
    setVisibleProjects([]);
    setIsLoading(true);
    
    // Update URL params
    if (filter === 'all') {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', filter);
    }
    setSearchParams(searchParams);
    
  // Load more initial projects for new filter - no delay
  const filteredData = filter === 'all' ? projects : projects.filter(p => 
    p.tags?.includes(filter) || 
    p.businessName?.toLowerCase().includes(filter.toLowerCase()) ||
    p.category === filter
  );
  const initialProjects = filteredData.slice(0, itemsPerPage * 2); // Load double amount
  setVisibleProjects(initialProjects);
  setIsLoading(false);
  };

  // Load initial projects when filtered projects change
  useEffect(() => {
    if (projects.length > 0) {
      const initialProjects = filteredProjects.slice(0, itemsPerPage * 2); // Load more initially
      setVisibleProjects(initialProjects);
      setCurrentPage(2); // Start from page 2 since we loaded more
    }
  }, [filteredProjects, projects, itemsPerPage]);

  // Update filter from URL param on mount
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam && tagParam !== activeFilter) {
      setActiveFilter(tagParam);
    }
  }, [searchParams]);

  // Get first 6 projects for preloading
  const projectsToPreload = visibleProjects.slice(0, 6);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
        <Helmet>
          {/* Preload first 6 images above the fold */}
          {projectsToPreload.map(project => (
            project.imageAfter && (
              <link 
                key={`preload-${project.id}`} 
                rel="preload" 
                as="image" 
                href={project.imageAfter}
              />
            )
          ))}
        </Helmet>
        
        <Navigation theme="light" />
        
        <main className="pt-20">
          <PortfolioHero />
          
          <FilterPills 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
          
          <section className="py-12">
            <MasonryGrid 
              projects={visibleProjects}
              isLoading={loading || (isLoading && visibleProjects.length === 0)}
              hasReachedMaxItems={hasReachedMaxItems}
            />
            
            {/* Load more button instead of auto infinite scroll */}
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white font-assistant font-semibold px-8 py-3 rounded-xl shadow-warm"
                >
                  ראה עוד דוגמאות
                </button>
              </div>
            )}
            
            {/* Loading indicator for pagination */}
            {isLoading && visibleProjects.length > 0 && !hasReachedMaxItems && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </motion.div>
            )}

            {/* Conversion CTA when reached max items */}
            {hasReachedMaxItems && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="text-6xl mb-6">✨</div>
                  <h3 className="text-3xl md:text-4xl font-assistant font-bold text-primary mb-4">
                    ראיתם את הטוב ביותר שלנו
                  </h3>
                  <p className="text-xl text-muted-foreground font-open-sans mb-8 max-w-2xl mx-auto">
                    מוכנים ליצור ויזואלים מרהיבים למסעדה / עסק שלכם? בואו נדבר!
                  </p>
                  
                  <div className="flex flex-col gap-4 justify-center items-center">
                    <motion.a
                      href="/contact"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-assistant font-semibold px-8 py-4 text-lg rounded-xl shadow-warm hover:shadow-elegant transition-all duration-300 inline-flex items-center gap-2"
                    >
                      בואו ניצור קסם למסעדה / עסק שלכם
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.a>
                    
                    {/* Removed 'איך זה עובד' button on portfolio page per request */}
                    
                    <motion.a
                      href="/contact"
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-assistant font-semibold px-6 py-3 text-lg rounded-xl transition-all duration-300 inline-flex items-center gap-2"
                    >
                      רוצה לראות עוד דוגמאות?
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </section>
          
          {/* Only show original CTA if haven't reached max items */}
          {!hasReachedMaxItems && <PortfolioCTA />}
        </main>
        
        <Footer />
      </div>
    );
};

export default Portfolio;