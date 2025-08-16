import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const FeatureWorkSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const businessSolutions = [
    {
      id: 1,
      title: 'מסעדות',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#restaurants'
    },
    {
      id: 2,
      title: 'מאפיות',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#bakeries'
    },
    {
      id: 3,
      title: 'קונדיטוריות',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#pastry'
    },
    {
      id: 4,
      title: 'דליקטסן',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#deli'
    },
    {
      id: 5,
      title: 'ברים ומשקאות',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#bars'
    },
    {
      id: 6,
      title: 'אוכל מהיר',
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#fast-food'
    },
    {
      id: 7,
      title: 'מוצרים ממותגים',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#branded'
    },
    {
      id: 8,
      title: 'קייטרינג ואירועים',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#catering'
    },
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
            פתרונות מותאמים לכל עסק
          </h2>
        </motion.div>

        {/* Horizontal Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
              direction: "rtl",
            }}
            className="w-full"
          >
            <CarouselContent className="-mr-4">
              {businessSolutions.map((solution, index) => (
                <CarouselItem key={solution.id} className="pr-4 basis-full md:basis-1/4 lg:basis-1/4">
                  <motion.a
                    href={solution.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isIntersecting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block"
                  >
                    <div className="w-[280px] h-[200px] md:w-[280px] md:h-[200px] lg:w-[280px] lg:h-[200px] relative">
                      {/* Background Image */}
                      <img
                        src={solution.image}
                        alt={solution.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Title on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <h3 className="text-xl md:text-2xl font-assistant font-bold text-white text-center px-4">
                          {solution.title}
                        </h3>
                      </div>
                    </div>
                  </motion.a>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -right-12 bg-primary hover:bg-primary/90 text-white border-primary" />
            <CarouselNext className="hidden md:flex -left-12 bg-primary hover:bg-primary/90 text-white border-primary" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureWorkSection;