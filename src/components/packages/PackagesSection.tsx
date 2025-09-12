import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { motion } from 'framer-motion';
import PackageCard from './PackageCard';
// import PackageModal from './PackageModal';

export type PackageItem = {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  imageSrc: string;
  whatsappText?: string;
};

const defaultPackages: PackageItem[] = [
  {
    id: 'trial',
    name: 'חבילות התנסות',
    price: '499₪',
    subtitle: '12 תמונות מקצועיות לנסות אותנו\nקיזוז מלא בחבילות הבאות',
    features: [
      '12 תמונות מקצועיות',
      'עד 6 מנות/מוצרים לבחירה',
      'תוך 72 שעות',
      'פגישת הדרכה בזום',
      '1 סבב עריכות',
      'עיצוב מותאם אישית למיתוג העסק'
    ],
    imageSrc: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    whatsappText: 'שלום, אני מתעניין בחבילת התנסות'
  },
  {
    id: 'full-menu',
    name: 'תפריט מלא',
    price: '1,100₪',
    subtitle: '25 תמונות מקצועיות לכל התפריט',
    features: [
      '25 תמונות מקצועיות',
      '8–9 מנות/מוצרים',
      'תוך 3 חודשים',
      '3 סבבי עריכות',
      'עיצוב מותאם לזהות',
      'אופטימיזציה לפלטפורמות'
    ],
    imageSrc: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    whatsappText: 'שלום, אני מתעניין בחבילת תפריט מלא'
  },
  {
    id: 'social-media',
    name: 'רשתות חברתיות',
    price: '890₪',
    subtitle: '20 תמונות + 10 סרטונים לתוכן שמוכר',
    features: [
      '20 תמונות + 10 סרטונים קצרים',
      'התאמה לפורמטים פופולריים',
      'תוכן מותאם למיתוג',
      '2 סבבי עריכות',
      'אספקה מדורגת לאורך החודש'
    ],
    imageSrc: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    whatsappText: 'שלום, אני מתעניין בחבילת רשתות חברתיות'
  },
  {
    id: 'subscription',
    name: 'מנוי חידוש',
    price: '490₪/חודש',
    subtitle: '15 פריטים חדשים כל חודש',
    features: [
      '15 פריטים/חודש (גמיש)',
      'קדימות בתורים',
      'התאמות עונתיות',
      '2 סבבי עריכות/חודש',
      'ביטול בכל עת (חודש מראש)'
    ],
    imageSrc: '/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png',
    whatsappText: 'שלום, אני מתעניין במנוי חידוש'
  }
];

const PackagesSection = ({ autoOpenId }: { autoOpenId?: string } = {}) => {
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: window.innerWidth < 768 ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  useEffect(() => {
    if (autoOpenId) {
      const target = defaultPackages.find(p => p.id === autoOpenId);
      if (target) setSelectedPackage(target);
    }
  }, [autoOpenId]);

  return (
    <>
      <section ref={ref} className="py-16 bg-background" dir="rtl">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate={isIntersecting ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              החבילות שלנו
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              פתרונות מותאמים אישית לכל עסק - מהתנסות ראשונה ועד מנוי מלא
            </motion.p>
          </motion.div>

          {/* Desktop/Tablet Grid */}
          <motion.div
            initial="hidden"
            animate={isIntersecting ? "visible" : "hidden"}
            variants={containerVariants}
            className="hidden sm:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {defaultPackages.map((pkg, index) => (
              <motion.div key={pkg.id} variants={itemVariants}>
                <PackageCard 
                  package={pkg} 
                  onClick={() => setSelectedPackage(pkg)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile Horizontal Scroll */}
          <motion.div
            initial="hidden"
            animate={isIntersecting ? "visible" : "hidden"}
            variants={containerVariants}
            className="sm:hidden"
          >
            <motion.div 
              variants={itemVariants}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {defaultPackages.map((pkg) => (
                <div key={pkg.id} className="flex-none w-80 snap-center">
                  <PackageCard 
                    package={pkg} 
                    onClick={() => setSelectedPackage(pkg)}
                  />
                </div>
              ))}
            </motion.div>
            
            {/* Scroll Indicator Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {defaultPackages.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/30"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Package modal removed during cleanup */}
    </>
  );
};

export default PackagesSection;