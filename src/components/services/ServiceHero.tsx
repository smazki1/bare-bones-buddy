import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, MessageCircle } from 'lucide-react';

const ServiceHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary-glow/30 to-secondary/20 bg-cover bg-center bg-no-repeat"
             style={{
               backgroundImage: `url('/lovable-uploads/c6d2bf37-2600-4108-a298-f663fc32ad15.png')`
             }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-assistant font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            כל השירותים במקום אחד
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 font-open-sans mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            פתרונות ויזואליים מקיפים לכל סוג עסק מזון
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Button 
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-assistant text-lg px-8 py-6 shadow-elegant"
            >
              <MessageCircle className="w-5 h-5 ml-2" />
              קבל הצעת מחיר
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-assistant text-lg px-8 py-6"
            >
              צפה בדוגמאות
            </Button>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <ArrowDown className="w-8 h-8 text-white/70 mx-auto animate-bounce" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceHero;