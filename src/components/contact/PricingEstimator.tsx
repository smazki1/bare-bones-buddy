import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const PricingEstimator = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  
  const [businessType, setBusinessType] = useState('');
  const [menuItems, setMenuItems] = useState([20]);
  const [serviceType, setServiceType] = useState('');
  
  const calculatePrice = () => {
    let basePrice = 0;
    let pricePerItem = 0;
    
    // Base price by business type
    switch (businessType) {
      case 'fine-dining':
        basePrice = 2000;
        pricePerItem = 120;
        break;
      case 'casual':
        basePrice = 1500;
        pricePerItem = 80;
        break;
      case 'fast-food':
        basePrice = 1000;
        pricePerItem = 50;
        break;
      case 'cafe':
        basePrice = 800;
        pricePerItem = 40;
        break;
      default:
        basePrice = 1200;
        pricePerItem = 60;
    }
    
    // Adjust by service type
    switch (serviceType) {
      case 'premium':
        basePrice *= 1.5;
        pricePerItem *= 1.5;
        break;
      case 'standard':
        // No change
        break;
      case 'basic':
        basePrice *= 0.8;
        pricePerItem *= 0.8;
        break;
    }
    
    const totalPrice = basePrice + (menuItems[0] * pricePerItem);
    return {
      min: Math.round(totalPrice * 0.8),
      max: Math.round(totalPrice * 1.2)
    };
  };
  
  const price = calculatePrice();

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
            מחשבון מחיר אינטראקטיבי
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            קבלו הערכת מחיר ראשונית בהתאם לצרכים שלכם
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-elegant">
                <div className="flex items-center mb-6">
                  <Calculator className="w-6 h-6 text-secondary ml-3" />
                  <h3 className="text-2xl font-assistant font-bold text-foreground">
                    הגדירו את הפרמטרים
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                      סוג העסק
                    </label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחרו סוג עסק" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fine-dining">מסעדה יוקרתית</SelectItem>
                        <SelectItem value="casual">מסעדה קז׳ואל</SelectItem>
                        <SelectItem value="fast-food">אוכל מהיר</SelectItem>
                        <SelectItem value="cafe">בית קפה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-assistant font-semibold text-foreground mb-4">
                      מספר מנות בתפריט: {menuItems[0]}
                    </label>
                    <Slider
                      value={menuItems}
                      onValueChange={setMenuItems}
                      max={100}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>5 מנות</span>
                      <span>100+ מנות</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                      רמת השירות
                    </label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחרו רמת שירות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">בסיסי - תמונות AI בלבד</SelectItem>
                        <SelectItem value="standard">סטנדרט - תמונות + עיצוב</SelectItem>
                        <SelectItem value="premium">פרימיום - פקג׳ מלא עם ייעוץ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-8 shadow-elegant border border-secondary/20">
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-6 h-6 text-secondary ml-3" />
                  <h3 className="text-2xl font-assistant font-bold text-foreground">
                    הערכת מחיר
                  </h3>
                </div>

                {businessType && serviceType ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="bg-white/50 rounded-xl p-6 mb-6">
                        <p className="text-sm text-muted-foreground font-open-sans mb-2">
                          טווח מחירים משוער
                        </p>
                        <div className="text-4xl font-assistant font-bold text-secondary mb-2">
                          ₪{price.min.toLocaleString()} - ₪{price.max.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground font-open-sans">
                          *המחיר הסופי יקבע לאחר ייעוץ אישי
                        </p>
                      </div>

                      <div className="space-y-3 text-right mb-6">
                        <div className="flex justify-between">
                          <span className="font-open-sans text-muted-foreground">מחיר בסיס:</span>
                          <span className="font-assistant font-semibold">₪{Math.round((price.min + price.max) / 2 - menuItems[0] * 60).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-open-sans text-muted-foreground">{menuItems[0]} מנות:</span>
                          <span className="font-assistant font-semibold">₪{Math.round(menuItems[0] * 60).toLocaleString()}</span>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between text-lg">
                          <span className="font-assistant font-bold">סה״כ משוער:</span>
                          <span className="font-assistant font-bold text-secondary">₪{Math.round((price.min + price.max) / 2).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90 font-assistant text-lg py-6"
                      asChild
                    >
                      <a href="#contact-form">
                        הזמן ייעוץ חינם לקבלת מחיר מדויק
                      </a>
                    </Button>

                    <div className="text-sm text-muted-foreground font-open-sans text-center">
                      <p>💡 הייעוץ הראשון תמיד ללא התחייבות</p>
                      <p>🎯 מחיר סופי לפי צרכים ייחודיים</p>
                      <p>⚡ הצעת מחיר תוך 24 שעות</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground font-open-sans">
                      בחרו את הפרמטרים כדי לראות הערכת מחיר
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingEstimator;