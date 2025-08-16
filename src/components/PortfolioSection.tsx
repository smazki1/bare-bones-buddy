import { useState } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from './ui/button';

interface ClientWork {
  id: number;
  businessName: string;
  businessType: string;
  beforeImage: string;
  afterImage: string;
  dishName: string;
}

const PortfolioSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const clientWorks: ClientWork[] = [
    {
      id: 1,
      businessName: 'פיצה נאפולי',
      businessType: 'מסעדה איטלקית',
      dishName: 'פיצה מרגריטה',
      beforeImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      businessName: 'מאפיית הכפר',
      businessType: 'מאפייה בוטיק',
      dishName: 'קרואסון חמאה',
      beforeImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      businessName: 'בורגר סטיישן',
      businessType: 'אוכל מהיר',
      dishName: 'המבורגר קלאסי',
      beforeImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 4,
      businessName: 'גרין סלאד',
      businessType: 'מסעדה בריאה',
      dishName: 'סלט קיץ',
      beforeImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      businessName: 'שוקולד בריו',
      businessType: 'קונדיטוריה',
      dishName: 'עוגת שוקולד',
      beforeImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 6,
      businessName: 'סטייק האוס',
      businessType: 'מסעדת בשרים',
      dishName: 'ריב איי סטייק',
      beforeImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 7,
      businessName: 'פסטה מאמא',
      businessType: 'מסעדה איטלקית',
      dishName: 'פסטה ברוטב עגבניות',
      beforeImage: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 8,
      businessName: 'בר משקאות',
      businessType: 'קוקטיילים',
      dishName: 'קוקטיל קיץ',
      beforeImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 9,
      businessName: 'חומוס אבו גוש',
      businessType: 'מסעדה ערבית',
      dishName: 'חומוס טחינה',
      beforeImage: 'https://images.unsplash.com/photo-1571197119717-7ba3d4b937ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1571197119717-7ba3d4b937ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 10,
      businessName: 'קפה לאטה',
      businessType: 'בית קפה',
      dishName: 'קפה עם לאטה ארט',
      beforeImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 11,
      businessName: 'עוגיות סבתא',
      businessType: 'מאפייה ביתית',
      dishName: 'עוגיות שוקולד צ\'יפס',
      beforeImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 12,
      businessName: 'מרק הבית',
      businessType: 'מסעדה ביתית',
      dishName: 'מרק ירקות עם קצף',
      beforeImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      afterImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    }
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
            הלקוחות שלנו מדברים בעד עצמם
          </h2>
        </motion.div>

        {/* Client Gallery Grid - 4x3 Desktop, 2xN Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {clientWorks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isIntersecting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl cursor-pointer"
              onMouseEnter={() => setHoveredItem(work.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="w-full aspect-square relative">
                {/* After Image (Default) */}
                <img
                  src={work.afterImage}
                  alt={`${work.dishName} - לאחר`}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    hoveredItem === work.id ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading="lazy"
                />
                
                {/* Before Image (On Hover) */}
                <img
                  src={work.beforeImage}
                  alt={`${work.dishName} - לפני`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    hoveredItem === work.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                />
                
                {/* Business Info Overlay */}
                <div 
                  className={`absolute inset-0 bg-black/60 flex flex-col justify-between p-4 transition-opacity duration-300 ${
                    hoveredItem === work.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="text-right">
                    <h3 className="text-white font-assistant font-bold text-lg drop-shadow-lg">
                      {work.businessName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white/90 font-open-sans text-sm drop-shadow-lg">
                      {work.businessType}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* See All Work Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-assistant font-semibold px-8 py-3"
          >
            צפה בכל העבודות
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;