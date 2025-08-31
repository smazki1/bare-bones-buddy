import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ContactForm = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    restaurantName: ''
  });

  // Simplified form: no services selection or file uploads

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.email || !formData.restaurantName) {
      toast({
        title: "שגיאה",
        description: "אנא מלאו את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "הודעה נשלחה בהצלחה!",
      description: "נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת",
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      restaurantName: ''
    });
  };

  return (
    <section ref={ref} id="contact-form" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            ספרו לנו על המסעדה שלכם
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            מלאו את הטופס ונחזור אליכם עם הצעת מחיר מותאמת אישית
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-2xl p-8 shadow-elegant">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    שם מלא *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="השם שלכם"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    טלפון *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="050-1234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    אימייל *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@restaurant.com"
                    required
                  />
                </div>
              </div>
              {/* Business Details */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  שם המסעדה / העסק *
                </label>
                <Input
                  value={formData.restaurantName}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                  placeholder="שם המסעדה או העסק"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-white px-12 py-4 text-lg font-assistant font-semibold"
                >
                  <Send className="w-5 h-5 ml-2" />
                  שלחו בקשה להצעת מחיר
                </Button>
                <p className="text-sm text-muted-foreground mt-4 font-open-sans">
                  נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
