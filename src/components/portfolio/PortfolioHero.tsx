import { motion } from 'framer-motion';

const PortfolioHero = () => {
  return (
    <section className="relative py-20 bg-gradient-subtle overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-assistant font-bold text-primary mb-6">
            התמונות שמזמינות את הלקוח לטעום
          </h1>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            גלה איך הפכנו מנות רגילות לתמונות שמוכרות בעצמן
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioHero;