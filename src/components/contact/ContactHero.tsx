import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const ContactHero = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-assistant font-bold text-white mb-6">
            בואו נדבר על המסעדה שלכם
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-open-sans max-w-3xl mx-auto mb-8">
            אנחנו כאן לכל שאלה, ייעוץ והצעת מחיר
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isIntersecting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a 
              href="#contact-form"
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-lg font-assistant font-semibold text-lg transition-all duration-200 hover:scale-105"
            >
              שלחו הודעה עכשיו
            </a>
            <a 
              href="#contact-methods"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-assistant font-semibold text-lg transition-all duration-200"
            >
              אפשרויות התקשרות
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHero;