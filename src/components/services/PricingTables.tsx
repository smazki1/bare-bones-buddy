import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const pricingPlans = [
  {
    name: 'בסיסי',
    price: '₪890',
    period: 'חד פעמי',
    description: 'מושלם לעסקים קטנים שרוצים להתחיל',
    icon: Zap,
    popular: false,
    features: [
      'עד 20 תמונות מקצועיות',
      'גדלים בסיסיים לרשתות חברתיות',
      'עיצוב גרפי פשוט',
      'אספקה תוך 5 ימי עסקים',
      'תמיכה בסיסית',
      'פורמט JPG בלבד'
    ],
    cta: 'התחל עכשיו',
    highlight: false
  },
  {
    name: 'מקצועי',
    price: '₪1,490',
    period: 'חד פעמי',
    description: 'הבחירה הפופולרית - הכי משתלם',
    icon: Star,
    popular: true,
    features: [
      'עד 40 תמונות מקצועיות',
      '5 סרטונים קצרים (15 שניות)',
      'כל הגדלים והפורמטים',
      'עיצוב גרафי מתקדם',
      'אספקה תוך 3 ימי עסקים',
      'תמיכה מועדפת',
      'פורמטים: JPG, PNG, MP4',
      'hashtags מותאמים'
    ],
    cta: 'בחר מקצועי',
    highlight: true
  },
  {
    name: 'פרימיום',
    price: '₪2,490',
    period: 'חד פעמי',
    description: 'פתרון מקיף עם ייעוץ אישי',
    icon: Crown,
    popular: false,
    features: [
      'תמונות ללא הגבלה',
      '10 סרטונים מתקדמים',
      'כל הפורמטים והגדלים',
      'עיצוב גרפי יוקרתי',
      'ייעוץ אישי והכוונה',
      'אספקה תוך 24 שעות',
      'תמיכה VIP',
      'עדכונים חינמיים לחודש',
      'קונספט אישי ומותאם'
    ],
    cta: 'קבל ייעוץ אישי',
    highlight: false
  }
];

const addOns = [
  { name: 'סרטון נוסף', price: '₪199' },
  { name: '10 תמונות נוספות', price: '₪299' },
  { name: 'עיצוב תפריט', price: '₪499' },
  { name: 'לוגו מותאם', price: '₪399' },
  { name: 'ייעוץ שיווק דיגיטלי', price: '₪599' },
  { name: 'ניהול רשתות חברתיות', price: '₪899/חודש' }
];

const PricingTables = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section 
      ref={elementRef}
      className="py-20 bg-gradient-to-b from-muted/30 to-background"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-6">
            החבילות שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            בחרו את החבילה המתאימה לכם - כל חבילה כוללת הכל מה שאתם צריכים
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${plan.highlight ? 'lg:scale-105' : ''}`}
            >
              <Card className={`h-full ${
                plan.highlight 
                  ? 'border-secondary shadow-glow bg-gradient-to-br from-secondary/5 to-primary/5' 
                  : 'border-border shadow-elegant'
              } relative overflow-hidden transition-shadow duration-300 hover:shadow-glow`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 left-0 bg-secondary text-white text-center py-2 font-assistant font-semibold">
                    הכי פופולרי
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      plan.highlight ? 'bg-gradient-to-br from-secondary to-primary' : 'bg-muted'
                    }`}>
                      <plan.icon className={`w-8 h-8 ${plan.highlight ? 'text-white' : 'text-primary'}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-assistant font-bold text-primary mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-assistant font-bold text-primary">{plan.price}</span>
                    <span className="text-sm text-muted-foreground font-open-sans mr-2">{plan.period}</span>
                  </div>
                  
                  <p className="text-muted-foreground font-open-sans">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-open-sans text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.highlight
                        ? 'bg-secondary hover:bg-secondary/90 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    } font-assistant text-lg py-6`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add-ons Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20"
        >
          <h3 className="text-2xl font-assistant font-bold text-primary text-center mb-8">
            שירותים נוספים
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon, index) => (
              <div 
                key={addon.name}
                className="bg-background rounded-lg p-4 border border-border flex justify-between items-center"
              >
                <span className="font-open-sans text-muted-foreground">{addon.name}</span>
                <span className="font-assistant font-bold text-primary">{addon.price}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white font-assistant"
            >
              בנה חבילה מותאמת אישית
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingTables;