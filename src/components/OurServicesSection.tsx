import { motion } from 'framer-motion';
import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

const OurServicesSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const [isContactOpen, setIsContactOpen] = useState(false);

  const services = [
    {
      id: 1,
      title: 'בנק תמונות לרשתות חברתיות',
      description: 'תוכן יומיומי שמביא לייקים',
      image: 'https://images.unsplash.com/photo-1611095973763-414019e72400?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'סרטוני רשתות חברתיות',
      description: 'סרטונים שעוצרים את הגלילה',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'קטלוג מוצרים מקצועי',
      description: 'קטלוג שמוכר את עצמו',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      title: 'תפריטים ויזואליים',
      description: 'תפריט שמעורר תיאבון',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      title: 'תמונות לאתרים',
      description: 'אתר שנראה כמו מיליון דולר',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  const ContactForm = () => (
    <form className="space-y-4">
      <div>
        <Label htmlFor="name">שם מלא</Label>
        <Input id="name" placeholder="הכנס את שמך המלא" />
      </div>
      <div>
        <Label htmlFor="business">שם העסק</Label>
        <Input id="business" placeholder="שם העסק שלך" />
      </div>
      <div>
        <Label htmlFor="phone">טלפון</Label>
        <Input id="phone" placeholder="מספר הטלפון שלך" />
      </div>
      <div>
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" type="email" placeholder="כתובת האימייל שלך" />
      </div>
      <div>
        <Label htmlFor="message">הודעה</Label>
        <Textarea id="message" placeholder="ספר לנו קצת על הצרכים שלך..." />
      </div>
      <Button type="submit" className="w-full">
        שלח הודעה
      </Button>
    </form>
  );

  return (
    <section ref={ref} className="py-20 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        {/* RTL Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-right mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary">
            הכל תחת קורת גג אחת
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* First row - 3 services */}
          {services.slice(0, 3).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300"
            >
              <div className="w-[300px] h-[200px] relative">
                {/* Background Image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                
                {/* Dark Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-assistant font-bold text-white mb-2 drop-shadow-lg">
                    {service.title}
                  </h3>
                  <p className="text-sm text-white/90 drop-shadow-lg mb-4">
                    {service.description}
                  </p>
                  
                  {/* More Details Button */}
                  <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-fit mx-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        variant="secondary"
                        size="sm"
                      >
                        פרטים נוספים
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-right">צור קשר</DialogTitle>
                      </DialogHeader>
                      <ContactForm />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Second row - 2 services centered */}
          <div className="md:col-start-1 md:col-end-4 lg:col-start-1 lg:col-end-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[632px] mx-auto">
              {services.slice(3, 5).map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: (index + 3) * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300"
                >
                  <div className="w-[300px] h-[200px] relative">
                    {/* Background Image */}
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    
                    {/* Dark Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Text Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-assistant font-bold text-white mb-2 drop-shadow-lg">
                        {service.title}
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-lg mb-4">
                        {service.description}
                      </p>
                      
                      {/* More Details Button */}
                      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-fit mx-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                            variant="secondary"
                            size="sm"
                          >
                            פרטים נוספים
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-right">צור קשר</DialogTitle>
                          </DialogHeader>
                          <ContactForm />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurServicesSection;