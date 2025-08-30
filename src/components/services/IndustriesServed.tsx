import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChefHat, 
  Coffee, 
  Cake, 
  Wine, 
  Users, 
  Store, 
  Factory, 
  Award 
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const industries = [
  {
    icon: ChefHat,
    title: 'מסעדות גורמה',
    description: 'מנות מתוחכמות שזוכות להצגה המגיעה להן',
    features: ['תפריטים יוקרתיים', 'מנות שף מיוחדות', 'אווירה אלגנטית'],
    color: 'from-primary to-primary-glow'
  },
  {
    icon: Store,
    title: 'אוכל מהיר',
    description: 'תמונות שמעוררות תיאבון ומזמינות להזמנה מיידית',
    features: ['מהירות אספקה', 'תמונות מושכות', 'מיתוג עקבי'],
    color: 'from-secondary to-accent'
  },
  {
    icon: Cake,
    title: 'מאפיות וקונדיטוריות',
    description: 'קסם המתיקות בכל תמונה',
    features: ['עוגות מעוצבות', 'מאפים טריים', 'מוצרי בוטיק'],
    color: 'from-pink-500 to-rose-400'
  },
  {
    icon: Wine,
    title: 'ברים ומשקאות',
    description: 'קוקטיילים ומשקאות שנראים בדיוק כמו שהם טועמים',
    features: ['קוקטיילים אמנותיים', 'משקאות מיוחדים', 'אווירת לילה'],
    color: 'from-purple-500 to-indigo-400'
  },
  {
    icon: Users,
    title: 'קייטרינג ואירועים',
    description: 'מגשי אירוח שמרשימים כבר במבט ראשון',
    features: ['מגשים מעוצבים', 'אירועים עסקיים', 'חתונות ובר מצוות'],
    color: 'from-green-500 to-emerald-400'
  },
  {
    icon: Award,
    title: 'מעדניות',
    description: 'מוצרי פרימיום שמשדרים איכות וטעם מעולה',
    features: ['גבינות מובחרות', 'יין ואלכוהול', 'מוצרי יוקרה'],
    color: 'from-amber-500 to-yellow-400'
  },
  {
    icon: Factory,
    title: 'יצרני מזון',
    description: 'קטלוגים מקצועיים שמציגים את המוצרים בצורה הטובה ביותר',
    features: ['קטלוגי מוצרים', 'אריזות מותגות', 'צילומי סטודיו'],
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: Coffee,
    title: 'מוצרים ממותגים',
    description: 'מיתוג ויזואלי עקבי שבונה זהות מותגית חזקה',
    features: ['עיצוב אריזות', 'זהות ויזואלית', 'קמפיינים מותגיים'],
    color: 'from-orange-500 to-red-400'
  }
];

const IndustriesServed = () => {
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
            התעשיות שאנחנו משרתים
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            מומחיות וניסיון בכל סוגי עסקי המזון - מהמסעדה הקטנה ועד הרשת הגדולה
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 group border-border">
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${industry.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <industry.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-assistant font-bold text-primary mb-3">
                    {industry.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground font-open-sans leading-relaxed mb-4">
                    {industry.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {industry.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 justify-center"
                      >
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                        <span className="text-xs font-open-sans text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-assistant font-bold text-primary mb-4">
              לא רואים את התעשייה שלכם?
            </h3>
            <p className="text-lg text-muted-foreground font-open-sans mb-6">
              אנחנו עובדים עם כל סוגי עסקי המזון - בואו נדבר ונמצא את הפתרון המתאים לכם
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-lg font-assistant text-lg font-semibold shadow-elegant"
            >
              בואו נדבר על הצרכים שלכם
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IndustriesServed;