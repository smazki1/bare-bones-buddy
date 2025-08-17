import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

interface Project {
  id: number;
  businessName: string;
  businessType: string;
  imageAfter: string;
  imageBefore: string;
  serviceType: 'תמונות' | 'סרטונים';
  size: 'small' | 'medium' | 'large';
  category: string;
}

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState('הכל');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const { ref: heroRef, isIntersecting: heroIntersecting } = useIntersectionObserver({ threshold: 0.3 });
  const { ref: ctaRef, isIntersecting: ctaIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  const filters = [
    'הכל', 'מסעדות', 'מאפיות', 'קונדיטוריות', 'מעדניות', 
    'ברים', 'אוכל מהיר', 'מוצרים ממותגים', 'קייטרינג'
  ];

  // Mock data generator
  const generateMockProjects = (startId: number, count: number): Project[] => {
    const businessTypes = {
      'מסעדות': ['מסעדת הגינה', 'ביסטרו תל אביב', 'מסעדת השף', 'אלמא'],
      'מאפיות': ['מאפיית הבוקר', 'לחם וחמאה', 'מאפיית אמא', 'הפיתה של סבא'],
      'קונדיטוריות': ['קונדיטוריית לה רוז', 'שוקולטה פלוס', 'עוגות הפיות', 'קרם וקצפת'],
      'מעדניות': ['מעדניית רמת השרון', 'דליקטסן טעמים', 'מעדניית הכפר', 'טעמי ים'],
      'ברים': ['בר המרתף', 'קוקטייל לאונג׳', 'בר 223', 'ספיק אנד איזי'],
      'אוכל מהיר': ['בורגר פוינט', 'פיצה אקספרס', 'שווארמה אלי', 'המבורגר שטורם'],
      'מוצרים ממותגים': ['חברת תבלינים', 'מותג יין', 'קפה פרמיום', 'שמן זית'],
      'קייטרינג': ['קייטרינג דליה', 'אירועי שמח', 'קייטרינג VIP', 'אוכל לאירועים']
    };

    const sizes = ['small', 'medium', 'large'] as const;
    const serviceTypes = ['תמונות', 'סרטונים'] as const;
    
    return Array.from({ length: count }, (_, i) => {
      const categories = Object.keys(businessTypes);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const businesses = businessTypes[category as keyof typeof businessTypes];
      const business = businesses[Math.floor(Math.random() * businesses.length)];
      
      return {
        id: startId + i,
        businessName: business,
        businessType: category,
        imageAfter: `https://images.unsplash.com/photo-${1500000000000 + (startId + i)}?w=400&h=${sizes[Math.floor(Math.random() * 3)] === 'small' ? '250' : sizes[Math.floor(Math.random() * 3)] === 'medium' ? '400' : '550'}&fit=crop&crop=entropy&auto=format`,
        imageBefore: `https://images.unsplash.com/photo-${1500000000000 + (startId + i) + 1000}?w=400&h=${sizes[Math.floor(Math.random() * 3)] === 'small' ? '250' : sizes[Math.floor(Math.random() * 3)] === 'medium' ? '400' : '550'}&fit=crop&crop=entropy&auto=format`,
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        category: category
      };
    });
  };

  // Initial load
  useEffect(() => {
    const loadInitialProjects = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const initialProjects = generateMockProjects(1, 20);
      setProjects(initialProjects);
      setFilteredProjects(initialProjects);
      setLoading(false);
    };

    loadInitialProjects();
  }, []);

  // Filter projects
  useEffect(() => {
    if (activeFilter === 'הכל') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category === activeFilter));
    }
  }, [activeFilter, projects]);

  // Load more projects
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    
    const newProjects = generateMockProjects((page * 20) + 1, 20);
    setProjects(prev => [...prev, ...newProjects]);
    setPage(prev => prev + 1);
    
    // Simulate end of data after 100 projects
    if (projects.length >= 80) {
      setHasMore(false);
    }
    
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, projects.length]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const getCardHeight = (size: string) => {
    switch (size) {
      case 'small': return 'h-[250px]';
      case 'medium': return 'h-[400px]';
      case 'large': return 'h-[550px]';
      default: return 'h-[400px]';
    }
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 2,
    500: 1
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      
      {/* Hero Section */}
      <section ref={heroRef} className="pt-20 pb-16 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-assistant font-bold text-primary mb-6">
              התמונות שמזמינות את הלקוח לטעום
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-open-sans leading-relaxed">
              כל אחת מהמנות כאן צולמה ונוצרה במיוחד בשביל לשקף את הסיפור והייחוד של העסק – 
              כך שכל מי שגולל, גם ירגיש וגם יזמין
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={heroIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-4"
      >
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`whitespace-nowrap px-6 py-3 rounded-full font-open-sans font-medium text-sm transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-[400px] rounded-2xl" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="flex w-auto -ml-6"
                  columnClassName="pl-6 bg-clip-padding"
                >
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`mb-6 ${getCardHeight(project.size)} relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer`}
                      onMouseEnter={() => setHoveredCard(project.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{ transformOrigin: 'center' }}
                    >
                      {/* Before/After Images */}
                      <div className="relative w-full h-full">
                        <img
                          src={project.imageAfter}
                          alt={`${project.businessName} - אחרי`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                            hoveredCard === project.id ? 'opacity-0' : 'opacity-100'
                          }`}
                          loading="lazy"
                        />
                        <img
                          src={project.imageBefore}
                          alt={`${project.businessName} - לפני`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                            hoveredCard === project.id ? 'opacity-100' : 'opacity-0'
                          }`}
                          loading="lazy"
                        />
                      </div>

                      {/* Service Type Badge */}
                      <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-medium">
                        {project.serviceType}
                      </div>

                      {/* Before/After Indicator */}
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {hoveredCard === project.id ? 'לפני' : 'אחרי'}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-assistant font-semibold text-lg mb-1 drop-shadow-lg">
                          {project.businessName}
                        </h3>
                        <p className="font-open-sans text-sm opacity-90 drop-shadow-md">
                          {project.businessType}
                        </p>
                      </div>

                      {/* Hover Scale Effect */}
                      <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                    </motion.div>
                  ))}
                </Masonry>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Loading More */}
          {loadingMore && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-open-sans">טוען עוד פרויקטים...</span>
              </div>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && filteredProjects.length > 0 && (
            <div className="text-center mt-12">
              <p className="text-muted-foreground font-open-sans">
                זה הכל! צפית בכל הפרויקטים שלנו
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={ctaIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-assistant font-bold text-primary mb-6">
              רוצה תוצאות כאלה למסעדה שלך?
            </h2>
            <p className="text-lg text-muted-foreground font-open-sans mb-8 leading-relaxed">
              כל פרויקט מתחיל בשיחה אחת - בואו נתחיל גם את שלכם
            </p>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white font-assistant font-semibold text-lg px-8 py-4 rounded-full"
            >
              בואו ניצור קסם למסעדה שלכם
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Portfolio;