import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { marketsStore } from '@/data/marketsStore';
import { MarketTag } from '@/types/markets';
import { useMemo, useState, useEffect } from 'react';

const SectorsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });
  const [config, setConfig] = useState(() => marketsStore.safeGetConfigOrDefaults());

  useEffect(() => {
    const loadConfig = () => {
      const newConfig = marketsStore.safeGetConfigOrDefaults();
      setConfig(newConfig);
    };

    loadConfig();

    // Listen for storage events to update config when admin changes it
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'food-vision-markets-config') {
        loadConfig();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const enabledMarkets = useMemo(() => 
    config.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order),
    [config.items]
  );

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
            {config.sectionTitle}
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            {config.sectionSubtitle}
          </p>
        </motion.div>

        {/* Grid Layout for Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enabledMarkets.map((market, index) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isIntersecting ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="group"
              >
                {market.slug ? (
                  <Link
                    to={`/portfolio?tag=${market.slug}`}
                    aria-label={`צפה בפורטפוליו של ${market.label}`}
                    className="block w-full h-full"
                  >
                    <div className="bg-gradient-to-br from-primary/90 to-primary hover:from-primary hover:to-primary/95 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-warm shadow-elegant group-hover:shadow-xl min-h-[120px] flex items-center justify-center border border-primary/20">
                      <h3 className="text-white font-assistant font-bold text-lg leading-relaxed">
                        {market.label}
                      </h3>
                    </div>
                  </Link>
                ) : (
                  <div 
                    className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-6 text-center cursor-not-allowed opacity-60 min-h-[120px] flex items-center justify-center border border-muted"
                    aria-disabled="true"
                  >
                    <h3 className="text-muted-foreground font-assistant font-bold text-lg leading-relaxed">
                      {market.label}
                    </h3>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Us Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 max-w-md mx-auto">
            <p className="text-muted-foreground font-open-sans mb-6 text-lg">
              לא מוצא את הקטגוריה שלך?
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-assistant font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-elegant hover:shadow-warm"
            >
              <Link to="/contact">
                צור קשר ונמצא פתרון!
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectorsSection;