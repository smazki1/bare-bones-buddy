import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { supabase } from '@/integrations/supabase/client';

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
    hero_subtitle: 'מה שלקח שבועות עם צלם — אצלנו מוכן תוך ימים, וב־90% פחות כסף,
    hero_cta_primary: 'צפה בתמונות המנות שלך עכשיו',
    hero_cta_secondary: 'ראה דוגמאות'
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
        .in('key', ['hero_title', 'hero_subtitle', 'hero_cta_primary', 'hero_cta_secondary']);

      if (data) {
        const contentMap = data.reduce((acc, item) => ({
          ...acc,
          [item.key]: item.value
        }), {});
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
            className="absolute w-2 h-2 bg-secondary/30 rounded-full"
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
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            dir="rtl"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-assistant font-bold mb-6 leading-tight tracking-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white">מנות מושלמות. </span>
            <span className="text-secondary">תמונות מושלמות.</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-white mb-8 font-open-sans font-semibold max-w-4xl mx-auto leading-relaxed drop-shadow-2xl text-shadow-lg border-2 border-white/20 bg-black/40 backdrop-blur-sm rounded-lg p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            dir="rtl"
          >
            מה שלקח שבועות עם צלם — אצלנו מוכן תוך ימים, וב־90% פחות כסף
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white px-10 py-7 text-xl font-assistant font-bold shadow-warm transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/services')}
            >
              {content.hero_cta_primary}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/95 text-primary hover:bg-white px-10 py-7 text-xl font-assistant font-bold border-0 shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/faq#top')}
            >
              {content.hero_cta_secondary}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;