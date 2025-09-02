import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ContactForm = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section ref={ref} id="contact-form" className="py-20 bg-gradient-subtle" dir="rtl">
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
            {/* Lead form per spec */}
            <form id="lead-form" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    שם מלא *
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="השם שלכם"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    טלפון *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="050-1234567"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    אימייל *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@restaurant.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="business" className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  שם המסעדה / העסק *
                </label>
                <Input
                  id="business"
                  name="business"
                  type="text"
                  placeholder="שם המסעדה או העסק"
                  required
                />
              </div>

              {/* Hidden client timestamp */}
              <input id="clientTimestamp" name="clientTimestamp" type="hidden" />

              {/* Submit and status */}
              <div className="text-center">
                <Button id="submitBtn" type="submit" className="bg-secondary hover:bg-secondary/90 text-white px-12 py-4 text-lg font-assistant font-semibold">
                  שלחו בקשה
                </Button>
                <div id="form-status" aria-live="polite" role="status" className="mt-4 text-sm font-open-sans"></div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
