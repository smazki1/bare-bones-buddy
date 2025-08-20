import { motion } from 'framer-motion';
import { Upload, FileText, Wand2, Download } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const ProcessOverview = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const steps = [
    {
      number: 1,
      icon: Upload,
      title: 'שולחים תמונות קיימות',
      description: 'אתם שולחים לנו תמונות בסיסיות של המנות - אפילו מהטלפון. ככל שהתמונות יותר ברורות, כך התוצאה תהיה יותר מדויקת.',
      time: '5 דקות',
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 2,
      icon: FileText,
      title: 'מקבלים הצעת מחיר',
      description: 'אנחנו בוחנים את החומר, מבינים את הצרכים שלכם ושולחים הצעת מחיר מפורטת עם לוח זמנים ברור.',
      time: '24 שעות',
      color: 'from-green-500 to-green-600'
    },
    {
      number: 3,
      icon: Wand2,
      title: 'אנחנו עובדים קסמים',
      description: 'הצוות שלנו משתמש בטכנולוגיית AI מתקדמת כדי ליצור תמונות מקצועיות מדהימות שמשקפות את המנות שלכם בצורה המושלמת.',
      time: '3-7 ימים',
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: 4,
      icon: Download,
      title: 'מקבלים תמונות מושלמות',
      description: 'אתם מקבלים את התמונות המוכנות בכל הפורמטים הנדרשים - לאתר, לרשתות חברתיות, להדפסה ולכל צורך אחר.',
      time: 'מיידי',
      color: 'from-orange-500 to-orange-600'
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
            איך זה עובד - בפשטות
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            4 שלבים פשוטים מהרעיון לתמונות מקצועיות מוכנות
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group"
              >
                {/* Connection Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 right-0 w-full h-0.5 bg-gradient-to-l from-border via-border to-transparent transform translate-x-1/2 z-0" />
                )}

                <div className="relative bg-card rounded-2xl p-8 shadow-elegant hover:shadow-warm transition-all duration-300 group-hover:scale-105 z-10">
                  {/* Step Number */}
                  <div className={`absolute -top-4 right-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-assistant font-bold text-xl shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                    <step.icon className="w-8 h-8 text-secondary" />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl font-assistant font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground font-open-sans text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Time Badge */}
                    <div className="inline-flex items-center px-3 py-1 bg-secondary/10 rounded-full">
                      <div className="w-2 h-2 bg-secondary rounded-full ml-2"></div>
                      <span className="text-sm font-assistant font-semibold text-secondary">
                        {step.time}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="bg-card rounded-2xl p-8 shadow-elegant border-2 border-secondary/20">
              <h3 className="text-2xl font-assistant font-bold text-foreground mb-4">
                התוצאה: תמונות שמוכרות את המסעדה שלכם
              </h3>
              <p className="text-muted-foreground font-open-sans max-w-3xl mx-auto mb-6">
                בתוך פחות משבוע תקבלו תמונות מקצועיות שיהפכו את התפריט שלכם למגנט לקוחות. 
                תמונות שיעבדו בכל מקום - באתר, ברשתות, בתפריט המודפס ובאפליקציות משלוחים.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <p className="font-assistant font-semibold text-foreground">עלייה בהזמנות</p>
                  <p className="text-sm text-muted-foreground">ממוצע 40% יותר קליקים</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="font-assistant font-semibold text-foreground">חיסכון בעלויות</p>
                  <p className="text-sm text-muted-foreground">80% זול מצלם מקצועי</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="font-assistant font-semibold text-foreground">מהירות ביצוע</p>
                  <p className="text-sm text-muted-foreground">מוכן תוך שבוע</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProcessOverview;