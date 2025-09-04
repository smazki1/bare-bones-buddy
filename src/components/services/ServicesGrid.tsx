import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Instagram, Video, BookOpen, Menu, Globe, Crown, Clock, Users, Target, Camera, Flame, Gift, Zap } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const services = [
  {
    icon: Gift,
    title: 'מבצע השקה',
    description: 'סרטון מקצועי במחיר מיוחד',
    includes: 'סרטון מקצועי מלא ואיכותי, בלי התחייבות, מבצע ללקוחות חדשים בלבד',
    suitableFor: 'עסקים שרוצים לבלוט ברשתות החברתיות',
    deliveryTime: '3–7 ימי עסקים',
    price: '₪99',
    originalPrice: 'במקום ₪299',
    popular: false,
    buttonText: 'אני רוצה לקבל פרטים נוספים'
  },
  {
    icon: Target,
    title: 'חבילת מבצע השקה',
    description: 'לנסות בלי סיכון',
    includes: '10-12 תמונות מקצועיות, פגישת אפיון אישית, זיכוי מלא 499₪ בחבילה הבאה',
    suitableFor: 'כל סוגי העסקים שרוצים לראות איך זה עובד',
    deliveryTime: '3–5 ימי עסקים',
    price: '₪499',
    popular: false,
    buttonText: 'התחל בלי סיכון - זיכוי מלא!'
  },
  {
    icon: Camera,
    title: 'חבילת טעימות',
    description: 'תמונות מקצועיות למסעדות ועסקים',
    includes: '60 תמונות מקצועיות, עד 12 מנות/מוצרים שונים, גדלים מותאמים לכל הפלטפורמות',
    suitableFor: 'בתי קפה, ביסטרו, מסעדות קטנות',
    deliveryTime: '5–7 ימי עסקים',
    price: '₪1,239',
    originalPrice: '₪740 לאחר זיכוי',
    popular: false
  },
  {
    icon: Flame,
    title: 'חבילת נוכחות דיגיטלית מלאה',
    description: 'הכי פופולרי – המותג שלכם בכל מקום',
    includes: '150 תמונות מקצועיות, עד 30 מנות/מוצרים שונים, 5 סרטונים, גדלים מותאמים לכל הפלטפורמות',
    suitableFor: 'מסעדות ועסקים שרוצים נוכחות דיגיטלית חזקה',
    deliveryTime: '7–10 ימי עסקים',
    price: '₪1,689',
    originalPrice: '₪1,190 לאחר זיכוי',
    popular: true
  },
  {
    icon: Crown,
    title: 'חבילת הפקת פרימיום',
    description: 'פתרון מושלם לרשתות גדולות',
    includes: '325+ תמונות מקצועיות, עד 60 מנות/מוצרים שונים, ייעוץ מיתוג דיגיטלי',
    suitableFor: 'רשתות, מסעדות גדולות',
    deliveryTime: '10–14 ימי עסקים',
    price: '₪2,939',
    originalPrice: '₪2,440 לאחר זיכוי',
    popular: false
  },
  {
    icon: Zap,
    title: 'חבילת On the Go',
    description: 'תמונות מקצועיות לפי הצורך',
    includes: 'יצירת תמונות לפי דרישה, מותאם לכל מנה/אירוע, באיכות גבוהה',
    suitableFor: 'עסקים שצריכים תמונות נקודתיות למנות חדשות ומבצעים מיוחדים',
    deliveryTime: '24–72 שעות (תלוי בכמות)',
    price: '₪120 לתמונה',
    popular: false
  },
  {
    icon: Instagram,
    title: 'בנק תמונות לרשתות חברתיות',
    description: 'יצירת תוכן יומי מקצועי',
    includes: '30-50 תמונות מקצועיות, גדלים שונים למגוון הפלטפורמות',
    suitableFor: 'כל סוגי העסקים',
    deliveryTime: '3–5 ימי עסקים',
    price: '₪890',
    popular: false
  },
  {
    icon: Video,
    title: 'סרטונים לרשתות חברתיות',
    description: 'סרטונים קצרים ומושכים',
    includes: '10-15 סרטונים, פורמטים שונים',
    suitableFor: 'עסקים דינמיים',
    deliveryTime: '5–7 ימי עסקים',
    price: '₪1,290',
    popular: false
  },
  {
    icon: BookOpen,
    title: 'קטלוג מוצרים מקצועי',
    description: 'קטלוג מושלם למכירות',
    includes: 'עד 100 מוצרים, עיצוב אחיד',
    suitableFor: 'יצרנים, סיטונאים',
    deliveryTime: '7–10 ימי עסקים',
    price: '₪1,890',
    popular: false
  },
  
];

const ServicesGrid = () => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section 
      ref={ref}
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
            השירותים שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            פתרונות מקיפים לכל צורך ויזואלי של העסק שלכם
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`h-full hover:shadow-elegant transition-all duration-300 border-2 ${
                service.popular 
                  ? 'border-secondary bg-gradient-to-br from-secondary/5 to-primary/5' 
                  : (index === 0 || index === 1) 
                    ? 'border-secondary/70 bg-gradient-to-br from-secondary/10 to-orange-50 shadow-lg hover:shadow-xl hover:scale-[1.02] ring-2 ring-secondary/20' 
                    : 'border-border'
              } relative overflow-hidden`}>
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-assistant font-semibold">
                    פופולרי
                  </div>
                )}
                
                {/* Special tag for launch promo */}
                {index === 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-assistant font-semibold animate-pulse">
                    🔥 מבצע השקה
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-sm font-assistant font-semibold animate-pulse">
                    🚀 מתחילים כאן
                  </div>
                )}
                
                <CardHeader className="text-right">
                  <div className="flex items-center justify-between mb-4">
                    <service.icon className="w-12 h-12 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-assistant font-bold text-primary mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground font-open-sans mb-4">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0" />
                      <span className="text-sm font-open-sans text-muted-foreground">
                        מה כלול: {service.includes}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-open-sans text-muted-foreground">
                        מתאים ל: {service.suitableFor}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-open-sans text-muted-foreground">
                        זמן ביצוע: {service.deliveryTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground font-open-sans">החל מ</span>
                      <div className="text-3xl font-assistant font-bold text-red-600">
                        {service.price}
                      </div>
                      {service.originalPrice && (
                        <div className="text-sm font-assistant font-semibold text-orange-500/80">
                          {service.originalPrice}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      asChild
                      className={`${
                        service.popular 
                          ? 'bg-secondary hover:bg-secondary/90' 
                          : (index === 0 || index === 1)
                            ? 'bg-gradient-to-r from-secondary to-orange-500 hover:from-secondary/90 hover:to-orange-600 shadow-lg'
                            : 'bg-primary hover:bg-primary/90'
                      } text-white font-assistant`}
                    >
                      <a
                        href={`https://wa.me/972527772807?text=${encodeURIComponent('אני מעוניין/ת בשירותי התמונות לעסק שלי')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {service.buttonText || 'צרו קשר לפרטים נוספים'}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button 
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white font-assistant text-lg px-8 py-6"
          >
            קבל הצעת מחיר מותאמת אישית
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesGrid;