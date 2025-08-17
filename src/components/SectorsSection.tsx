import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const SectorsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  const sectors = [
    { id: 1, name: 'מנות מסעדות', href: '#portfolio?category=restaurants' },
    { id: 2, name: 'מאפים', href: '#portfolio?category=bakeries' },
    { id: 3, name: 'משקאות', href: '#portfolio?category=beverages' },
    { id: 4, name: 'מגשי אירוח', href: '#portfolio?category=catering' },
    { id: 5, name: 'מגשי פירות', href: '#portfolio?category=fruits' },
    { id: 6, name: 'מוצרים ממותגים', href: '#portfolio?category=branded' },
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
            שווקים שאנו עובדים איתם
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            אנחנו מתמחים בסוגי מוצרים ושירותים מגוונים בתחום המזון
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector, index) => (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isIntersecting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 text-lg font-assistant font-semibold border-2 border-border hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <a href={sector.href}>
                    {sector.name}
                  </a>
                </Button>
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