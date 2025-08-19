import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { marketsStore } from '@/data/marketsStore';
import { MarketTag } from '@/types/markets';
import { useMemo } from 'react';

const SectorsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });
  
  const config = useMemo(() => marketsStore.safeGetConfigOrDefaults(), []);
  const enabledMarkets = useMemo(() => 
    config.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order),
    [config.items]
  );

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4 text-right">
            {config.sectionTitle}
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto text-right">
            {config.sectionSubtitle}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {enabledMarkets.map((market, index) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 10 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                className="flex justify-center"
              >
                {market.slug ? (
                  <Link
                    to={`/portfolio?tag=${market.slug}`}
                    aria-label={`פתיחת קטלוג מסונן: ${market.label}`}
                    className="group"
                  >
                    <div className="bg-background border border-border rounded-full px-5 py-3 text-foreground font-assistant font-semibold text-base transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      {market.label}
                    </div>
                  </Link>
                ) : (
                  <div 
                    className="bg-background border border-border rounded-full px-5 py-3 text-muted-foreground font-assistant font-semibold text-base cursor-default"
                    aria-disabled="true"
                  >
                    {market.label}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground font-open-sans mb-6">
            לא מוצא את הקטגוריה שלך? צור קשר ונמצא פתרון!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SectorsSection;