import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { supabase } from '@/integrations/supabase/client';
import { usePortfolioStore } from '@/data/portfolioStore';

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [heroImages, setHeroImages] = useState([
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ]);
  const [content, setContent] = useState({
    hero_title: 'מנות מושלמות. תמונות מושלמות.',
    hero_subtitle: 'כל מה שצריך ליצירת תמונות ברמת סטודיו מקצועי - ב-90% פחות כסף',
    hero_cta_primary: 'תיק עבודות',
    hero_cta_secondary: 'איך זה עובד'
  });
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 250]);

  useEffect(() => {
    fetchSiteContent();
    fetchBackgroundImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const fetchSiteContent = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .in('key', ['hero_title', 'hero_subtitle', 'hero_cta_secondary']);

      if (data) {
        const allowedKeys = new Set(['hero_title', 'hero_subtitle', 'hero_cta_secondary']);
        const contentMap = data.reduce((acc: Record<string, string>, item: { key: string; value: any }) => {
          if (
            allowedKeys.has(item.key) &&
            typeof item.value === 'string' &&
            item.value.trim().length > 0
          ) {
            acc[item.key] = item.value;
          }
          return acc;
        }, {} as Record<string, string>);
        setContent(prev => ({ ...prev, ...contentMap }));
      }
    } catch (error) {
      console.error('Error fetching site content:', error);
    }
  };

  const fetchBackgroundImages = async () => {
    try {
      const { data } = await supabase
        .from('background_images')
        .select('url, title')
        .eq('active', true)
        .order('id');

      if (data && data.length > 0) {
        setHeroImages(data.map(img => img.url));
      }
    } catch (error) {
      console.error('Error fetching background images:', error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentImage ? 1 : 0,
              scale: index === currentImage ? 1.05 : 1
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ))}
        
        {/* Overlay - גרדיינט חזק יותר לקריאות טובה */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        
        {/* Pink/Red Colored Overlay */}
        <div className="absolute inset-0 bg-primary/40" />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-secondary/30 rounded-full hidden sm:block"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <Navigation theme="dark" />

      {/* Hero Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-6xl mx-auto">
          <motion.h1
            dir="rtl"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-assistant font-bold mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white">מנות מושלמות. </span>
            <span className="text-secondary">תמונות מושלמות.</span>
          </motion.h1>

          <motion.p
            dir="rtl"
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 font-open-sans font-semibold max-w-4xl mx-auto leading-relaxed drop-shadow-2xl border-2 border-white/20 bg-black/40 backdrop-blur-sm rounded-lg p-4 sm:p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {content.hero_subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Button 
              size="lg" 
<<<<<<< Updated upstream
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white px-7 sm:px-9 lg:px-12 py-5 sm:py-7 lg:py-8 text-base sm:text-lg lg:text-2xl font-assistant font-bold shadow-warm transition-all duration-300 hover:scale-105 pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/portfolio');
              }}
=======
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white px-7 sm:px-9 lg:px-12 py-5 sm:py-7 lg:py-8 text-base sm:text-lg lg:text-2xl font-assistant font-bold shadow-warm transition-all duration-300 hover:scale-105"
              onMouseEnter={() => {
                try { usePortfolioStore.getState().fetchProjects(); } catch (_) {}
              }}
              onFocus={() => {
                try { usePortfolioStore.getState().fetchProjects(); } catch (_) {}
              }}
              onClick={() => navigate('/portfolio')}
>>>>>>> Stashed changes
            >
              {content.hero_cta_primary}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto bg-white/95 text-primary hover:bg-white px-7 sm:px-9 lg:px-12 py-5 sm:py-7 lg:py-8 text-base sm:text-lg lg:text-2xl font-assistant font-bold border-0 shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/faq#top')}
            >
              {content.hero_cta_secondary}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1 sm:mt-2 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;