import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import FilterPills from '@/components/portfolio/FilterPills';
import MasonryGrid from '@/components/portfolio/MasonryGrid';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
// Infinite scroll disabled; using manual "Load more" button
import { Project } from '@/data/portfolioMock';
import { portfolioStore, PORTFOLIO_UPDATE_EVENT } from '@/data/portfolioStore';
// Remote fetch disabled: local-only portfolio

const ITEMS_PER_PAGE = 12;
const MAX_ITEMS_DISPLAY = 24;

const Portfolio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(searchParams.get('tag') || 'all');
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Load projects from Supabase and local store with instant loading
  useEffect(() => {
    const loadProjects = async () => {
      console.log('🔄 Starting portfolio load...');
      try {
        // Check if we might have cached data for faster loading
        const hasCache = localStorage.getItem('portfolioConfig_v2');
        console.log('📦 Cache status:', hasCache ? 'exists' : 'empty');
        
        if (!hasCache) {
          setIsInitialLoading(true);
        }
        
        const storedProjects = await portfolioStore.getProjects();
        console.log('📊 Loaded projects:', storedProjects.length);
        console.log('🖼️ First project:', storedProjects[0]?.businessName, storedProjects[0]?.imageAfter?.substring(0, 50));
        setAllProjects(storedProjects);
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        setAllProjects([]); // Set empty array on error
      } finally {
        setIsInitialLoading(false);
        console.log('✅ Portfolio load complete');
      }
    };

    // Load initially
    loadProjects();

    // Listen for real-time updates from admin - now just sync local state
    const handleUpdate = async () => {
      try {
        console.log('🔄 Updating from realtime...');
        // Get updated projects from store (already updated by realtime)
        const updatedProjects = await portfolioStore.getProjects();
        console.log('📊 Updated projects count:', updatedProjects.length);
        setAllProjects(updatedProjects);
      } catch (error) {
        console.error('❌ Error syncing projects:', error);
      }
    };

    window.addEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate);
    
    return () => {
      window.removeEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate);
    };
  }, []);

  // Filter projects based on active filter
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') {
      return allProjects;
    }
    // Support both legacy single category and new multi-tags
    return allProjects.filter(project => 
      project.category === activeFilter || project.tags?.includes(activeFilter)
    );
  }, [activeFilter, allProjects]);

  // Check if there are more pages to load and haven't reached max display limit
  const hasReachedMaxItems = visibleProjects.length >= MAX_ITEMS_DISPLAY;
  const hasNextPage = currentPage * ITEMS_PER_PAGE < filteredProjects.length && !hasReachedMaxItems;

  // Load next page of projects
  const fetchNextPage = async () => {
    if (isLoading || !hasNextPage) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Calculate next batch, ensuring we don't exceed MAX_ITEMS_DISPLAY
    const nextItemsCount = Math.min(
      (currentPage + 1) * ITEMS_PER_PAGE,
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
    setCurrentPage(1);
    setVisibleProjects([]);
    setIsLoading(true);
    
    // Update URL params
    if (filter === 'all') {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', filter);
    }
    setSearchParams(searchParams);
    
    // Load initial projects for new filter
    setTimeout(() => {
      const filteredData = filter === 'all' ? allProjects : allProjects.filter(p => p.category === filter);
      const initialProjects = filteredData.slice(0, ITEMS_PER_PAGE);
      setVisibleProjects(initialProjects);
      setIsLoading(false);
    }, 300);
  };

  // Load initial projects when filtered projects change
  useEffect(() => {
    console.log('🔄 Loading initial projects...', { 
      isInitialLoading, 
      allProjectsLength: allProjects.length,
      filteredProjectsLength: filteredProjects.length 
    });
    
    if (!isInitialLoading && allProjects.length > 0) {
      const initialProjects = filteredProjects.slice(0, ITEMS_PER_PAGE);
      console.log('📋 Setting visible projects:', initialProjects.length);
      console.log('🖼️ Sample project:', initialProjects[0]?.businessName, initialProjects[0]?.imageAfter?.substring(0, 50));
      setVisibleProjects(initialProjects);
      setCurrentPage(1);
    }
  }, [filteredProjects, isInitialLoading, allProjects]);

  // Update filter from URL param on mount
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam && tagParam !== activeFilter) {
      setActiveFilter(tagParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
              isLoading={isInitialLoading || (isLoading && visibleProjects.length === 0)}
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
                    
                    <motion.a
                      href="/faq"
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-assistant font-semibold px-6 py-3 text-lg rounded-xl transition-all duration-300 inline-flex items-center gap-2"
                    >
                      איך זה עובד
                    </motion.a>
                    
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