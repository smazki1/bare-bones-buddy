import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Clock, 
  Headphones, 
  Gift,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const guarantees = [
  {
    icon: RefreshCw,
    title: 'החזר כספי מלא',
    subtitle: 'לא מרוצה? מחזירים כסף!',
    description: 'אם אתם לא מרוצים מהתוצאה תוך 7 ימים - מחזירים את הכסף במלואו, ללא שאלות',
    features: [
      'החזר תוך 48 שעות',
      'ללא תנאים מסובכים',
      'שמירה על הקבצים שקיבלתם'
    ],
    highlight: true
  },
  {
    icon: Clock,
    title: 'זמני אספקה מובטחים',
    subtitle: 'בזמן או בחינם',
    description: 'התחייבנו לזמני אספקה ואנחנו עומדים בהם. איחור? הפרויקט הבא חינם',
    features: [
      'מעקב בזמן אמת',
      'התראות על התקדמות',
      'עדכונים שוטפים'
    ],
    highlight: false
  },
  {
    icon: Headphones,
    title: 'תמיכה ושירות מעולים',
    subtitle: '24/7 כאן בשבילכם',
    description: 'צוות התמיכה שלנו זמין תמיד לעזור, לייעץ ולוודא שאתם מרוצים',
    features: [
      'תמיכה בעברית',
      'מענה תוך שעתיים',
      'ייעוץ מקצועי חינם'
    ],
    highlight: false
  },
  {
    icon: Gift,
    title: 'עדכונים חינמיים',
    subtitle: 'תמיד מעודכנים',
    description: 'שינויים קטנים בתפריט? תמונות נוספות? אנחנו כאן לעדכן אתכם',
    features: [
      'עדכונים ראשונים חינם',
      'שינויים קלים ללא עלות',
      'גיבוי של כל הגרסאות'
    ],
    highlight: false
  }
];

const additionalPromises = [
  'שמירה על סודיות המידע',
  'עבודה עם הלוגו והצבעים שלכם',
  'פורמטים מתאימים לכל פלטפורמה',
  'הכשרה על השימוש בתמונות',
  'ייעוץ שיווק דיגיטלי בסיסי',
  'גישה לעדכונים עתידיים'
];

const GuaranteesSection = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section 
      ref={elementRef}
      className="py-20 bg-background"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-6">
            ההתחייבויות שלנו אליכם
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            אנחנו לא רק מספקים שירות - אנחנו מתחייבים לשביעות הרצון המלאה שלכם
          </p>
        </motion.div>

        {/* Main Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={guarantee.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`h-full ${
                guarantee.highlight 
                  ? 'border-secondary shadow-glow bg-gradient-to-br from-secondary/5 to-primary/5' 
                  : 'border-border shadow-elegant'
              } relative overflow-hidden hover:shadow-glow transition-shadow duration-300`}>
                {guarantee.highlight && (
                  <div className="absolute top-0 right-0 left-0 bg-secondary text-white text-center py-2 font-assistant font-semibold text-sm">
                    ההתחייבות המרכזית שלנו
                  </div>
                )}
                
                <CardContent className={`p-8 ${guarantee.highlight ? 'pt-12' : ''}`}>
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                      guarantee.highlight 
                        ? 'bg-gradient-to-br from-secondary to-primary' 
                        : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                    }`}>
                      <guarantee.icon className={`w-8 h-8 ${
                        guarantee.highlight ? 'text-white' : 'text-primary'
                      }`} />
                    </div>
                    
                    <div className="flex-1 text-right">
                      <h3 className="text-2xl font-assistant font-bold text-primary mb-2">
                        {guarantee.title}
                      </h3>
                      
                      <p className="text-secondary font-assistant font-semibold mb-4">
                        {guarantee.subtitle}
                      </p>
                      
                      <p className="text-muted-foreground font-open-sans leading-relaxed mb-6">
                        {guarantee.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {guarantee.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                            <span className="text-sm font-open-sans text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Promises */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20"
        >
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-assistant font-bold text-primary mb-4">
              עוד התחייבויות שחשובות לנו
            </h3>
            <p className="text-lg text-muted-foreground font-open-sans">
              כי השירות שלנו זה לא רק התמונות - זה כל החוויה
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalPromises.map((promise, index) => (
              <motion.div
                key={promise}
                initial={{ opacity: 0, x: -20 }}
                animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                className="flex items-center gap-3 bg-background rounded-lg p-4 border border-border"
              >
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="font-open-sans text-muted-foreground text-sm">
                  {promise}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-assistant font-bold text-primary mb-4">
              בטוחים בשירות שלנו
            </h3>
            <p className="text-lg text-muted-foreground font-open-sans mb-8">
              אנחנו כל כך בטוחים שתהיו מרוצים, שאנחנו מוכנים להתחייב על כל המילים שלנו
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-lg font-assistant text-lg font-semibold shadow-elegant"
            >
              בואו נתחיל בביטחון מלא
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GuaranteesSection;