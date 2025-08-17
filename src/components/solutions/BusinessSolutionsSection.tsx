import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type CardItem = {
  id: string;
  title: string;
  imageSrc?: string;
  videoSrc?: string;
  tagSlug?: string;
  href?: string | null;
  enabled?: boolean;
};

const BUSINESS_SOLUTIONS: CardItem[] = [
  {
    id: 'restaurants',
    title: 'מסעדות ובתי קפה',
    videoSrc: 'https://videos.pexels.com/video-files/3196330/3196330-uhd_2560_1440_25fps.mp4',
    tagSlug: 'restaurants',
    href: '/portfolio?tag=restaurants',
    enabled: true
  },
  {
    id: 'bakeries',
    title: 'מאפיות וקונדיטוריות',
    imageSrc: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tagSlug: 'bakeries',
    href: '/portfolio?tag=bakeries',
    enabled: true
  },
  {
    id: 'fast-food',
    title: 'אוכל מהיר ורשתות',
    imageSrc: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tagSlug: 'fast-food',
    href: '/portfolio?tag=fast-food',
    enabled: true
  },
  {
    id: 'premium',
    title: 'מוצרי יוקרה וקייטרינג',
    imageSrc: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tagSlug: 'premium',
    href: '/portfolio?tag=premium',
    enabled: true
  }
];

const BusinessSolutionsCard = ({ item, index }: { item: CardItem; index: number }) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: window.innerWidth >= 768 ? 12 : 0 
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration: 0.35,
        delay: index * 0.08,
        ease: "easeOut"
      }}
      className="group relative aspect-[16/11] rounded-2xl overflow-hidden shadow-soft cursor-pointer transform transition-transform duration-200 hover:scale-105"
      onClick={() => {
        if (item.href) {
          window.location.href = item.href;
        }
      }}
    >
      {/* Background Media */}
      {item.videoSrc ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={item.imageSrc}
        >
          <source src={item.videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img
          src={item.imageSrc}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-200" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white font-assistant font-bold text-xl leading-tight drop-shadow-lg">
          {item.title}
        </h3>
      </div>
    </motion.div>
  );
};

const BusinessSolutionsSection = () => {
  const enabledSolutions = BUSINESS_SOLUTIONS.filter(item => item.enabled);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-assistant font-bold text-primary mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            פתרונות מותאמים לכל עסק
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground font-open-sans leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            מתמחים ביצירת תוכן ויזואלי מקצועי שמתאים בדיוק לסגנון ולצרכים של העסק שלכם
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {enabledSolutions.map((item, index) => (
            <BusinessSolutionsCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessSolutionsSection;