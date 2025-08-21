import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Lightbulb, 
  Building, 
  Users, 
  Handshake,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const customSolutions = [
  {
    icon: Lightbulb,
    title: 'פתרונות מותאמים אישית',
    description: 'יש לכם צורך מיוחד? אנחנו יוצרים בדיוק מה שאתם צריכים',
    features: [
      'ייעוץ אישי מקיף',
      'פיתוח פתרון ייעודי',
      'התאמה מלאה לצרכים',
      'תמיכה צמודה לאורך הדרך'
    ],
    cta: 'בואו נדבר על הרעיון שלכם'
  },
  {
    icon: Building,
    title: 'פתרונות לעסקים גדולים',
    description: 'רשתות מסעדות ועסקים בקנה מידה גדול - יש לנו הניסיון',
    features: [
      'ניהול פרויקטים מורכבים',
      'עבודה עם צוותים גדולים',
      'סטנדרטים אחידים',
      'דיווחים ומעקב מתקדמים'
    ],
    cta: 'קבלו הצעה לארגון'
  },
  {
    icon: Users,
    title: 'שותפויות אסטרטגיות',
    description: 'עבודה ארוכת טווח עם הטבות מיוחדות ושירות VIP',
    features: [
      'תעריפים מיוחדים',
      'עדיפות בביצוע',
      'ייעוץ אסטרטגי שוטף',
      'גישה לחידושים ראשונים'
    ],
    cta: 'הצטרפו לשותפות'
  },
  {
    icon: Handshake,
    title: 'שירותי ייעוץ מתקדמים',
    description: 'לא רק תמונות - ייעוץ שיווק דיגיטלי ואסטרטגיה מקיפה',
    features: [
      'אסטרטגיית תוכן',
      'ייעוץ שיווק דיגיטלי',
      'בניית מותג',
      'הדרכות צוות'
    ],
    cta: 'קבלו ייעוץ מקצועי'
  }
];

const processSteps = [
  'שיחת היכרות ללא תשלום',
  'הבנת הצרכים והאתגרים',
  'הצעה מותאמת ומפורטת',
  'תכנון ויישום הפתרון',
  'מעקב ושיפור מתמיד'
];

const CustomSolutions = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section 
      ref={elementRef}
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
            צריכים משהו מיוחד?
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            החבילות הסטנדרטיות שלנו מכסות רוב הצרכים, אבל אנחנו יודעים שלפעמים אתם צריכים פתרון מותאם במיוחד
          </p>
        </motion.div>

        {/* Custom Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {customSolutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <solution.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-assistant font-bold text-primary">
                      {solution.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground font-open-sans leading-relaxed">
                    {solution.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0" />
                        <span className="text-sm font-open-sans text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white font-assistant group-hover:border-secondary group-hover:text-secondary group-hover:hover:bg-secondary group-hover:hover:text-white transition-colors"
                  >
                    {solution.cta}
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Process Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20 mb-16"
        >
          <h3 className="text-2xl font-assistant font-bold text-primary text-center mb-8">
            איך התהליך של פתרון מותאם עובד?
          </h3>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary to-primary/20 transform -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {processSteps.map((step, index) => (
                <div key={step} className="relative text-center">
                  <div className="w-12 h-12 bg-white border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-4 font-assistant font-bold text-primary relative z-10">
                    {index + 1}
                  </div>
                  <p className="text-sm font-open-sans text-muted-foreground leading-tight">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-assistant font-bold mb-4">
              מוכנים להתחיל לעבד ביחד?
            </h3>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              השיחה הראשונה תמיד חינמית. בואו נכיר, נבין מה אתם צריכים, ונבנה משהו מדהים ביחד
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-assistant text-lg px-8 py-6"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                שיחת ייעוץ חינם
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-assistant text-lg px-8 py-6"
              >
                שאלות? בוא נדבר
              </Button>
            </div>
            
            <p className="text-sm mt-6 opacity-75">
              אין התחייבות, אין לחץ - רק שיחה טובה על איך אנחנו יכולים לעזור לכם
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomSolutions;