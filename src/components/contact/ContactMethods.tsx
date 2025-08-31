import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';

const ContactMethods = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const contactMethods = [
    {
      icon: Phone,
      title: 'טלפון',
      description: 'שיחה ישירה עם המומחים שלנו',
      info: '052-777-2807',
      subInfo: 'א׳-ה׳ 09:00-20:00',
      action: 'tel:052-777-2807',
      actionText: 'התקשרו עכשיו'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'תגובה מהירה בוואטסאפ',
      info: 'הודעה מיידית',
      subInfo: 'זמינים עד 22:00',
      action: 'https://wa.me/972527772807?text=היי, אני רוצה לשמוע על השירותים שלכם למסעדה שלי',
      actionText: 'שלחו הודעה'
    },
    {
      icon: Mail,
      title: 'אימייל',
      description: 'שלחו פרטים מפורטים',
      info: 'info@foodvision.co.il',
      subInfo: '',
      action: 'mailto:info@foodvision.co.il?subject=בקשה לפרטים על שירותי צילום AI',
      actionText: 'שלחו מייל'
    }
  ];

  return (
    <section ref={ref} id="contact-methods" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            איך אפשר ליצור קשר?
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            בחרו את הדרך הנוחה לכם ביותר - אנחנו כאן לעזור
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-elegant hover:shadow-warm transition-all duration-300 text-center group hover:scale-105 max-w-sm w-full"
            >
              <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                <method.icon className="w-8 h-8 text-secondary" />
              </div>
              
              <h3 className="text-xl font-assistant font-bold text-foreground mb-2">
                {method.title}
              </h3>
              
              <p className="text-muted-foreground font-open-sans text-sm mb-4">
                {method.description}
              </p>
              
              <div className="space-y-1 mb-6">
                <p className="font-assistant font-semibold text-foreground">
                  {method.info}
                </p>
                {method.subInfo && (
                  <p className="text-sm text-muted-foreground font-open-sans">
                    {method.subInfo}
                  </p>
                )}
              </div>
              
              <Button 
                asChild 
                className="w-full bg-secondary hover:bg-secondary/90 font-assistant"
              >
                <a 
                  href={method.action}
                  target={method.action.startsWith('http') ? '_blank' : '_self'}
                  rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {method.actionText}
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactMethods;