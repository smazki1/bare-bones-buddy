import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const ProductsSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const products = [
    {
      id: 1,
      name: 'חבילת התנסות',
      price: '499₪',
      originalPrice: null,
      description: 'מושלם להתחלה',
      features: [
        '60 תמונות מקצועיות',
        '10-12 מנות לבחירתך',
        'עיצוב גרפי מותאם',
        'תמונות ברזולוציה גבוהה',
        'תמונות לרשתות חברתיות'
      ],
      popular: false,
      cta: 'בחר חבילה'
    },
    {
      id: 2,
      name: 'נוכחות דיגיטלית מלאה',
      price: '1,190₪',
      originalPrice: '1,689₪',
      description: 'הכי פופולרי',
      features: [
        '150 תמונות מקצועיות',
        '25-30 מנות לבחירתך',
        'עיצוב גרפי מותאם',
        'תמונות ברזולוציה גבוהה',
        'תמונות לרשתות חברתיות',
        '5 סרטוני וידאו קצרים',
        'תמונות לאפליקציות משלוחים'
      ],
      popular: true,
      cta: 'בחר חבילה'
    },
    {
      id: 3,
      name: 'הפקת פרימיום',
      price: '2,440₪',
      originalPrice: '2,939₪',
      description: 'עבור עסקים מתקדמים',
      features: [
        '325 תמונות מקצועיות',
        '50-60 מנות לבחירתך',
        'עיצוב גרפי מותאם',
        'תמונות ברזולוציה גבוהה',
        'תמונות לרשתות חברתיות',
        '10 סרטוני וידאו קצרים',
        'תמונות לאפליקציות משלוחים',
        'ייעוץ מיתוג ושיווק דיגיטלי'
      ],
      popular: false,
      cta: 'בחר חבילה'
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            השירותים שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            בחר את החבילה המתאימה לעסק שלך וקבל תמונות מקצועיות תוך ימים
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative rounded-2xl p-8 shadow-elegant hover:shadow-warm transition-all duration-500 hover:scale-105 ${
                product.popular 
                  ? 'bg-gradient-to-br from-primary to-primary-glow text-white border-2 border-secondary' 
                  : 'bg-card border border-border'
              }`}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-secondary text-white px-4 py-2 rounded-full text-sm font-assistant font-semibold">
                    הכי פופולרי
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-assistant font-bold mb-2 ${
                  product.popular ? 'text-white' : 'text-primary'
                }`}>
                  {product.name}
                </h3>
                <p className={`text-sm font-open-sans ${
                  product.popular ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {product.description}
                </p>
                
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-4xl font-assistant font-bold ${
                      product.popular ? 'text-white' : 'text-primary'
                    }`}>
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className={`text-lg line-through ${
                        product.popular ? 'text-white/60' : 'text-muted-foreground'
                      }`}>
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <p className={`text-sm mt-1 ${
                      product.popular ? 'text-white/80' : 'text-secondary'
                    }`}>
                      זיכוי 499₪ (לאחר זיכוי חבילת ניסיון)
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {product.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      product.popular ? 'text-secondary' : 'text-primary'
                    }`} />
                    <span className={`font-open-sans ${
                      product.popular ? 'text-white' : 'text-foreground'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full font-assistant font-semibold ${
                  product.popular 
                    ? 'bg-secondary hover:bg-secondary/90 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
                size="lg"
              >
                {product.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground font-open-sans mb-6">
            לא בטוח איזו חבילה מתאימה לך? בוא נדבר!
          </p>
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-white font-assistant"
          >
            צור קשר לייעוץ חינם
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;