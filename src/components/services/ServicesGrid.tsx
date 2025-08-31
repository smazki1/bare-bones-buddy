import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Instagram, Video, BookOpen, Menu, Globe, Crown, Clock, Users } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const services = [
  {
    icon: Instagram,
    title: 'בנק תמונות לרשתות חברתיות',
    description: 'יצירת תוכן יומי מקצועי',
    includes: '30-50 תמונות, גדלים שונים, hashtags',
    suitableFor: 'כל סוגי העסקים',
    deliveryTime: '3-5 ימים',
    price: '₪890',
    popular: false
  },
  {
    icon: Video,
    title: 'סרטונים לרשתות חברתיות',
    description: 'סרטונים קצרים ומושכים',
    includes: '10-15 סרטונים, פורמטים שונים',
    suitableFor: 'עסקים דינמיים',
    deliveryTime: '5-7 ימים',
    price: '₪1,290',
    popular: true
  },
  {
    icon: BookOpen,
    title: 'קטלוג מוצרים מקצועי',
    description: 'קטלוג מושלם למכירות',
    includes: 'עד 100 מוצרים, עיצוב אחיד',
    suitableFor: 'יצרנים, סיטונאים',
    deliveryTime: '7-10 ימים',
    price: '₪1,890',
    popular: false
  },
  {
    icon: Menu,
    title: 'תפריטים ויזואליים',
    description: 'תפריט שמעורר תיאבון',
    includes: 'כל המנות, עיצוב תפריט',
    suitableFor: 'מסעדות, בתי קפה',
    deliveryTime: '5-8 ימים',
    price: '₪1,490',
    popular: false
  },
  {
    icon: Globe,
    title: 'תמונות לאתר',
    description: 'אתר שנראה מיליון דולר',
    includes: 'תמונות אתר, באנרים',
    suitableFor: 'כל העסקים',
    deliveryTime: '3-5 ימים',
    price: '₪690',
    popular: false
  },
  {
    icon: Crown,
    title: 'פתרונות מותגים',
    description: 'חבילה מקיפה ומותאמת',
    includes: 'הכל + ייעוץ אישי',
    suitableFor: 'עסקים גדולים',
    deliveryTime: '10-14 ימים',
    price: '₪2,990',
    popular: false
  }
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
              <Card className={`h-full hover:shadow-elegant transition-shadow duration-300 border-2 ${
                service.popular ? 'border-secondary bg-gradient-to-br from-secondary/5 to-primary/5' : 'border-border'
              } relative overflow-hidden`}>
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-assistant font-semibold">
                    פופולרי
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
                      <div className="text-3xl font-assistant font-bold text-primary">
                        {service.price}
                      </div>
                    </div>
                    
                    <Button 
                      asChild
                      className={`${
                        service.popular 
                          ? 'bg-secondary hover:bg-secondary/90' 
                          : 'bg-primary hover:bg-primary/90'
                      } text-white font-assistant`}
                    >
                      <a
                        href={`https://wa.me/972527772807?text=${encodeURIComponent('אני מעוניין/ת בשירותי התמונות לעסק שלי')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        צרו קשר לפרטים נוספים
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