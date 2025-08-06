import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import Navigation from './Navigation';

const HeroSection = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after 2-3 seconds delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden" dir="rtl">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        >
          <source 
            src="https://cdn.pixabay.com/video/2020/06/15/42310-433748605_large.mp4" 
            type="video/mp4" 
          />
          {/* Fallback image */}
          <img 
            src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Food Background"
            className="w-full h-full object-cover"
          />
        </video>
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Hero Content */}
      <div className="relative z-20 flex items-center justify-center h-screen px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
            style={{ fontFamily: 'Assistant, sans-serif' }}
            initial={{ opacity: 0, y: 50 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            הפסיקו לצלם.{' '}
            <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
              התחילו ליצור.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 font-open-sans max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            הופכים כל מנה ליצירת אמנות ויזואלית שמוכרת. בלי צלמים, בלי סטודיו, בלי פשרות.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white px-12 py-8 text-xl font-assistant font-semibold shadow-warm transform hover:scale-105 transition-all duration-300"
            >
              צרו קסם ויזואלי עכשיו
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1, y: [0, 10, 0] } : { opacity: 0 }}
        transition={{ 
          opacity: { duration: 1, delay: 1 },
          y: { duration: 2, repeat: Infinity, delay: 1 }
        }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;