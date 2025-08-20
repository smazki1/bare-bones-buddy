import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';

const SuccessStories = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const stories = [
    {
      restaurant: 'מסעדת הים התיכון',
      type: 'מסעדה ים תיכונית',
      challenge: 'התמונות הישנות לא שיקפו את איכות המזון',
      solution: 'יצירת 45 תמונות AI מקצועיות לכל התפריט',
      results: [
        { metric: 'עלייה בהזמנות', value: '+65%', icon: TrendingUp },
        { metric: 'לייקים ברשתות', value: '+280%', icon: Users },
        { metric: 'דירוג ממוצע', value: '4.8/5', icon: Star }
      ],
      quote: 'הלקוחות שלנו לא מפסיקים להגיד שהתמונות נראות בדיוק כמו המנות. המכירות עלו משמעותיות!',
      owner: 'יוסי כהן, בעל המסעדה',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      restaurant: 'פיצרית נונו',
      type: 'פיצרייה משפחתית',
      challenge: 'תחרות קשה מרשתות גדולות',
      solution: 'צילומי AI של 20 סוגי פיצה + תוספות',
      results: [
        { metric: 'הזמנות משלוח', value: '+45%', icon: TrendingUp },
        { metric: 'לקוחות חדשים', value: '+120', icon: Users },
        { metric: 'שביעות רצון', value: '4.9/5', icon: Star }
      ],
      quote: 'בזכות התמונות החדשות אנחנו מתחרים בהצלחה עם הרשתות הגדולות. הלקוחות מגיעים בגלל התמונות!',
      owner: 'דנה לוי, מנהלת',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      restaurant: 'בית קפה מרכזי',
      type: 'בית קפה ומאפייה',
      challenge: 'רצו לשדרג את המראה הדיגיטלי',
      solution: 'תמונות AI לכל הקפה והמאפים',
      results: [
        { metric: 'פוסטים ויראליים', value: '8', icon: TrendingUp },
        { metric: 'עוקבים חדשים', value: '+2.1K', icon: Users },
        { metric: 'ביקורות חיוביות', value: '98%', icon: Star }
      ],
      quote: 'האינסטגרם שלנו השתנה לגמרי. הפוסטים מקבלים פי 10 יותר לייקים מבעבר!',
      owner: 'רון גולן, בעלים',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
            סיפורי הצלחה
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            איך הלקוחות שלנו שינו את העסק שלהם עם תמונות AI מקצועיות
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {stories.map((story, index) => (
            <motion.div
              key={story.restaurant}
              initial={{ opacity: 0, y: 30 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-card rounded-2xl shadow-elegant hover:shadow-warm transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.restaurant}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4 text-white">
                  <h3 className="text-xl font-assistant font-bold mb-1">
                    {story.restaurant}
                  </h3>
                  <p className="text-white/90 text-sm font-open-sans">
                    {story.type}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Challenge & Solution */}
                <div className="mb-6">
                  <div className="mb-3">
                    <span className="text-xs font-assistant font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                      האתגר
                    </span>
                    <p className="text-sm text-muted-foreground font-open-sans mt-1">
                      {story.challenge}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-assistant font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      הפתרון
                    </span>
                    <p className="text-sm text-muted-foreground font-open-sans mt-1">
                      {story.solution}
                    </p>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-3 mb-6">
                  {story.results.map((result, resultIndex) => (
                    <div key={resultIndex} className="flex items-center justify-between p-3 bg-gradient-to-l from-secondary/5 to-transparent rounded-lg">
                      <div className="flex items-center">
                        <result.icon className="w-4 h-4 text-secondary ml-2" />
                        <span className="text-sm font-open-sans text-muted-foreground">
                          {result.metric}
                        </span>
                      </div>
                      <span className="font-assistant font-bold text-secondary">
                        {result.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div className="bg-secondary/5 rounded-lg p-4 border-r-4 border-secondary">
                  <p className="text-sm font-open-sans text-muted-foreground italic mb-2">
                    "{story.quote}"
                  </p>
                  <p className="text-xs font-assistant font-semibold text-foreground">
                    {story.owner}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-assistant font-bold text-foreground mb-4">
              רוצים להיות הסיפור הבא?
            </h3>
            <p className="text-muted-foreground font-open-sans mb-6">
              הצטרפו למאות לקוחות מרוצים שהפכו את התמונות שלהם לכלי מכירה חזק
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-secondary hover:bg-secondary/90 font-assistant text-lg px-8 py-6"
                asChild
              >
                <a href="#contact-form">
                  בואו נתחיל את הסיפור שלכם
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="font-assistant text-lg px-8 py-6"
                asChild
              >
                <a href="/portfolio">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  קראו עוד סיפורי הצלחה
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SuccessStories;