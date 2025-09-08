import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { OptimizedImage } from './ui/optimized-image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const FeatureWorkSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const featureItems = [
    {
      id: 1,
      title: 'ספקי מזון',
      description: 'פתרונות לאירועים',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'suppliers'
    },
    {
      id: 2,
      title: 'מסעדות',
      description: 'תפריטים מושלמים',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'restaurants'
    },
    {
      id: 3,
      title: 'אוכל מהיר',
      description: 'מהירות ושיווק',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'fast-food'
    },
    {
      id: 4,
      title: 'מאפיות',
      description: 'מסורת במראה חדש',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'bakeries'
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            העבודות שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            גלה איך אנחנו מסייעים לעסקים שונים ליצור תמונות מקצועיות
          </p>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-8 pb-4" style={{ width: 'max-content' }}>
            {featureItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 100 }}
                animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105">
                  <div className="aspect-[4/3] relative">
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      aspectRatio="4/3"
                      quality={80}
                      width={800}
                      className="transition-transform duration-500 group-hover:scale-110"
                      priority={index < 2} // First 2 images load with priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-2xl font-assistant font-bold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/90 font-open-sans text-lg mb-4">
                        {item.description}
                      </p>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 font-assistant"
                      >
                        צפה בדוגמאות
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureWorkSection;