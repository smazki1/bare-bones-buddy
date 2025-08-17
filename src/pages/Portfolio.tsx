import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import FilterPills from '@/components/portfolio/FilterPills';
import MasonryGrid from '@/components/portfolio/MasonryGrid';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import { useInfiniteScrollPortfolio } from '@/utils/useInfiniteScrollPortfolio';
import { fullPortfolioData, Project } from '@/data/portfolioMock';

const ITEMS_PER_PAGE = 20;

const Portfolio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(searchParams.get('tag') || 'all');
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter projects based on active filter
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') {
      return fullPortfolioData;
    }
    return fullPortfolioData.filter(project => project.category === activeFilter);
  }, [activeFilter]);

  // Check if there are more pages to load
  const hasNextPage = currentPage * ITEMS_PER_PAGE < filteredProjects.length;

  // Load next page of projects
  const fetchNextPage = async () => {
    if (isLoading || !hasNextPage) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const nextPageProjects = filteredProjects.slice(
      0, 
      (currentPage + 1) * ITEMS_PER_PAGE
    );
    
    setVisibleProjects(nextPageProjects);
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  };

  // Infinite scroll hook
  const { sentinelRef } = useInfiniteScrollPortfolio({
    hasNextPage,
    isFetching: isLoading,
    fetchNextPage
  });

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
      const initialProjects = (filter === 'all' ? fullPortfolioData : fullPortfolioData.filter(p => p.category === filter))
        .slice(0, ITEMS_PER_PAGE);
      setVisibleProjects(initialProjects);
      setIsLoading(false);
    }, 300);
  };

  // Load initial projects
  useEffect(() => {
    const initialProjects = filteredProjects.slice(0, ITEMS_PER_PAGE);
    setVisibleProjects(initialProjects);
  }, []);

  // Update filter from URL param on mount
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam && tagParam !== activeFilter) {
      setActiveFilter(tagParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
        <Navigation />
        
        <main className="pt-20">
          <PortfolioHero />
          
          <FilterPills 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
          
          <section className="py-12">
            <MasonryGrid 
              projects={visibleProjects}
              isLoading={isLoading && visibleProjects.length === 0}
            />
            
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-10" />
            
            {/* Loading indicator for pagination */}
            {isLoading && visibleProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </motion.div>
            )}
          </section>
          
          <PortfolioCTA />
        </main>
        
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
};

export default Portfolio;