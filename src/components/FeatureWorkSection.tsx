import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

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
      title: 'מאפיות וקונדיטוריות',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#bakeries'
    },
    {
      id: 3,
      title: 'מטבחי רפאים ועסקי משלוחים',
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#delivery'
    },
    {
      id: 4,
      title: 'יצרני מזון וסלסלות שי',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '#producers'
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

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {businessSolutions.map((solution, index) => (
            <motion.a
              key={solution.id}
              href={solution.href}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 cursor-pointer block"
            >
              <div className="aspect-[4/3] relative">
                {/* Background Image */}
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Title on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-white text-center px-4" style={{ fontFamily: 'Assistant, sans-serif' }}>
                    {solution.title}
                  </h3>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureWorkSection;