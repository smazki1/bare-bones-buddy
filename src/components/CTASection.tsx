import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const CTASection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

  return (
    <section ref={ref} className="py-20 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-assistant font-bold text-white mb-6 leading-tight"
          >
            התחל ליצור תמונות מושלמות עכשיו
          </motion.h2>


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col gap-6 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white px-12 py-6 text-xl font-assistant font-bold shadow-warm hover:scale-105 transition-all duration-300"
            >
              <a 
                href="https://wa.me/972527772807?text=שלום, אני מעוניין/ת לקבל הצעת מחיר מותאמת אישית לשירותי התמונות לעסק שלי"
                target="_blank"
                rel="noopener noreferrer"
              >
                קבל הצעת מחיר מותאמת אישית
              </a>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white/80 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-primary px-8 py-4 text-lg font-assistant font-semibold shadow-lg"
            >
              <a href="/faq">איך זה עובד</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isIntersecting ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 text-white/80 font-open-sans text-lg"
          >
            <p>💯 ללא סיכון • ⚡ תוצאות מהירות • 🎯 איכות מובטחת</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;