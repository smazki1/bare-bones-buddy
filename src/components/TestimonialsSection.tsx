import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, ExternalLink } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const TestimonialsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const testimonials = [
    {
      id: 1,
      businessName: 'טעמים לאירועים',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      socialLinks: [
        { icon: Instagram, url: 'https://instagram.com/tamim-events', label: 'Instagram' }
      ],
      category: 'ספקי מזון'
    },
    {
      id: 2,
      businessName: 'דג הזהב',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      socialLinks: [
        { icon: Twitter, url: 'https://twitter.com/golden-fish', label: 'Twitter' }
      ],
      category: 'מסעדות'
    },
    {
      id: 3,
      businessName: 'בורגר פלאש',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      socialLinks: [
        { icon: Instagram, url: 'https://instagram.com/burger-flash', label: 'Instagram' }
      ],
      category: 'אוכל מהיר'
    },
    {
      id: 4,
      businessName: 'חלות של שבת',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      socialLinks: [
        { icon: Facebook, url: 'https://facebook.com/challot-shabbat', label: 'Facebook' }
      ],
      category: 'מאפיות'
    }
  ];

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
            הלקוחות שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            עסקים שהבינו את העתיד = כבר חוסכים אלפי שקלים בכל חודש
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105">
                <div className="aspect-square relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.businessName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl font-assistant font-bold mb-2">
                      {testimonial.businessName}
                    </h3>
                    <p className="text-white/80 font-open-sans text-sm mb-4">
                      {testimonial.category}
                    </p>
                    
                    <div className="flex gap-3">
                      {testimonial.socialLinks.map((social, socialIndex) => {
                        const IconComponent = social.icon;
                        return (
                          <a
                            key={socialIndex}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary transition-colors duration-300 group/icon"
                            aria-label={`${testimonial.businessName} ${social.label}`}
                          >
                            <IconComponent className="w-4 h-4 text-white group-hover/icon:scale-110 transition-transform duration-300" />
                          </a>
                        );
                      })}
                      <a
                        href="#"
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors duration-300 group/icon"
                        aria-label="צפה בפרויקט"
                      >
                        <ExternalLink className="w-4 h-4 text-white group-hover/icon:scale-110 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;