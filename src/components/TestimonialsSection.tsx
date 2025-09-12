import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  client_name: string;
  client_business?: string;
  content: string;
  rating: number;
  is_featured: boolean;
  order_index: number;
}

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    client_name: 'יוסי כהן',
    client_business: 'מסעדת הדג הזהב',
    content: 'התמונות שקיבלנו פשוט מדהימות! המכירות שלנו עלו ב-30% מאז שהתחלנו להשתמש בתמונות מ-Food Vision',
    rating: 5,
    is_featured: true,
    order_index: 1
  },
  {
    id: '2',
    client_name: 'רחל לוי',
    client_business: 'מאפיית שושנה',
    content: 'שירות מקצועי ומהיר. התמונות של החלות והעוגות שלנו נראות כמו במגזינים!',
    rating: 5,
    is_featured: true,
    order_index: 2
  }
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(mockTestimonials);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('order_index')
        .limit(6);

      if (data && data.length > 0) {
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
    ));
  };

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            הלקוחות שלנו
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            לקוחות מרוצים שחוסכים זמן וכסף עם Food Vision
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <blockquote className="text-foreground/90 mb-4 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="border-t border-border/50 pt-4">
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.client_name}
                    </div>
                    {testimonial.client_business && (
                      <div className="text-muted-foreground text-xs">
                        {testimonial.client_business}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;