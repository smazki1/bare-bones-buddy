import { motion } from 'framer-motion';
import { Clock, Phone, MessageCircle, Mail, AlertCircle } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const BusinessHours = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const hours = [
    { day: 'ראשון', time: '09:00 - 20:00', available: true },
    { day: 'שני', time: '09:00 - 20:00', available: true },
    { day: 'שלישי', time: '09:00 - 20:00', available: true },
    { day: 'רביעי', time: '09:00 - 20:00', available: true },
    { day: 'חמישי', time: '09:00 - 20:00', available: true },
    { day: 'שישי', time: '09:00 - 14:00', available: true },
    { day: 'שבת', time: 'סגור', available: false },
  ];

  const contactChannels = [
    {
      icon: Phone,
      title: 'טלפון',
      hours: 'א׳-ה׳ 09:00-20:00, ו׳ 09:00-14:00',
      response: 'מענה מיידי',
      note: 'לשיחות דחופות בלבד'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      hours: '24/7',
      response: 'תגובה תוך שעתיים',
      note: 'הדרך הנוחה ביותר'
    },
    {
      icon: Mail,
      title: 'אימייל',
      hours: 'תמיד פתוח',
      response: 'תגובה תוך 4 שעות',
      note: 'למידע מפורט וקבצים'
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
            שעות פעילות ותגובה
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            מתי אפשר ליצור קשר ומה זמני התגובה
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-elegant">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-secondary ml-3" />
                  <h3 className="text-2xl font-assistant font-bold text-foreground">
                    שעות עבודה
                  </h3>
                </div>

                <div className="space-y-4">
                  {hours.map((schedule, index) => (
                    <motion.div
                      key={schedule.day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      className={`flex justify-between items-center p-4 rounded-lg ${
                        schedule.available 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="font-assistant font-semibold text-foreground">
                        {schedule.day}
                      </span>
                      <span className={`font-open-sans ${
                        schedule.available ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {schedule.time}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-secondary mt-0.5 ml-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-assistant font-semibold text-foreground mb-1">
                        לקוחות קיימים - תמיכה דחופה
                      </h4>
                      <p className="text-sm font-open-sans text-muted-foreground">
                        לקוחות קיימים יכולים ליצור קשר גם מחוץ לשעות העבודה 
                        במספר הנוסף: <strong>054-123-4567</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Response Times */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-elegant">
                <h3 className="text-2xl font-assistant font-bold text-foreground mb-6">
                  זמני תגובה לפי ערוץ
                </h3>

                <div className="space-y-6">
                  {contactChannels.map((channel, index) => (
                    <motion.div
                      key={channel.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="bg-secondary/10 rounded-full w-12 h-12 flex items-center justify-center ml-4 flex-shrink-0">
                          <channel.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-assistant font-bold text-foreground mb-1">
                            {channel.title}
                          </h4>
                          <p className="text-sm text-muted-foreground font-open-sans mb-2">
                            <strong>שעות זמינות:</strong> {channel.hours}
                          </p>
                          <p className="text-sm text-green-600 font-open-sans font-semibold mb-2">
                            {channel.response}
                          </p>
                          <p className="text-xs text-muted-foreground font-open-sans">
                            💡 {channel.note}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg p-6">
                    <h4 className="font-assistant font-bold text-foreground mb-2">
                      התחייבות השירות שלנו
                    </h4>
                    <p className="text-sm font-open-sans text-muted-foreground">
                      אנחנו מתחייבים לחזור אליכם תוך הזמנים המצוינים לעיל. 
                      אם לא קיבלתם מענה - תמיד אפשר להתקשר ישירות!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessHours;