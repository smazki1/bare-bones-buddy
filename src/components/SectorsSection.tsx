import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const SectorsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  const businessTypes = [
    'מסעדות',
    'מאפיות', 
    'ברים',
    'קפה ומשקאות',
    'אוכל מהיר',
    'קונדיטוריות',
    'דליקטסן',
    'קייטרינג',
    'מוצרי יוקרה',
    'אירועים',
    'יצרנים'
  ];

  return (
    <section ref={ref} className="py-20 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        {/* RTL Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-right mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary">
            השירותים שלנו מתאימים לכל סוג עסק
          </h2>
        </motion.div>

        {/* Tags Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isIntersecting ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-wrap justify-end gap-2">
            {businessTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isIntersecting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-[#2A2A2A] text-white px-5 py-3 rounded-[25px] font-open-sans font-medium text-sm"
              >
                {type}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectorsSection;