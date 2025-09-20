import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PortfolioCTA = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-subtle"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-6">
            רוצה תוצאות כאלה למסעדה שלך?
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans mb-8 max-w-2xl mx-auto">
            כל פרויקט מתחיל בשיחה אחת — בואו נתחיל גם את שלכם
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 items-center"
          >
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-assistant font-semibold px-8 py-4 text-lg shadow-warm hover:shadow-elegant transition-all duration-300"
              asChild
            >
              <a href="/contact">
                בואו ניצור קסם למסעדה / עסק שלכם
                <ArrowLeft className="mr-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PortfolioCTA;