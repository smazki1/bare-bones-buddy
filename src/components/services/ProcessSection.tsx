import { motion } from 'framer-motion';
import { Phone, Upload, Lightbulb, Cpu, CheckCircle, Truck } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const processSteps = [
  {
    icon: Phone,
    title: 'שיחת היכרות וייעוץ',
    description: 'נכיר אתכם ואת הצרכים שלכם, נייעץ על הפתרון הטוב ביותר',
    time: '30 דקות'
  },
  {
    icon: Upload,
    title: 'קבלת החומרים הקיימים',
    description: 'תשלחו לנו תמונות קיימות, לוגו, ומידע על המותג שלכם',
    time: '1 יום'
  },
  {
    icon: Lightbulb,
    title: 'יצירת קונספט ראשוני',
    description: 'נכין עבורכם קונספט ויזואלי ודוגמאות ראשוניות לאישור',
    time: '2-3 ימים'
  },
  {
    icon: Cpu,
    title: 'עבודה טכנולוגית מתקדמת',
    description: 'הטכנולוגיה שלנו יוצרת תמונות מושלמות בדיוק המקסימלי',
    time: '3-5 ימים'
  },
  {
    icon: CheckCircle,
    title: 'בקרת איכות ועיצובים',
    description: 'בודקים כל תמונה ותמונה, מתאימים לעיצוב הגרפי שלכם',
    time: '1-2 ימים'
  },
  {
    icon: Truck,
    title: 'אספקה ותמיכה',
    description: 'מקבלים את כל הקבצים בפורמטים שונים + תמיכה מתמשכת',
    time: 'מיידי'
  }
];

const ProcessSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section 
      ref={ref}
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-6">
            איך זה עובד - שלב אחר שלב
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            תהליך פשוט, שקוף ומקצועי שמבטיח תוצאות מושלמות
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-primary/20 via-secondary to-primary/20" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-background border-2 border-border rounded-2xl p-8 text-center shadow-elegant hover:shadow-glow transition-shadow duration-300 relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 right-4 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-assistant font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-assistant font-bold text-primary mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground font-open-sans leading-relaxed mb-4">
                    {step.description}
                  </p>
                  
                  <div className="inline-block bg-muted px-3 py-1 rounded-full text-sm font-open-sans text-muted-foreground">
                    {step.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-assistant font-bold text-primary mb-4">
              מוכנים להתחיל?
            </h3>
            <p className="text-lg text-muted-foreground font-open-sans mb-6">
              השלב הראשון תמיד חינם - בואו נכיר ונבין איך אנחנו יכולים לעזור לכם
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-lg font-assistant text-lg font-semibold shadow-elegant"
            >
              קבעו שיחת ייעוץ חינם
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;