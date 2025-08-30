import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Zap, 
  Shield, 
  Target, 
  Cpu, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const techFeatures = [
  {
    icon: Cpu,
    title: 'בינה מלאכותית מתקדמת',
    description: 'טכנולוגיית AI חדישה שמותאמת במיוחד לתמונות מזון',
    details: ['אלגוריתמים מתקדמים', 'למידת מכונה עמוקה', 'עיבוד תמונה מתקדם']
  },
  {
    icon: Target,
    title: 'דיוק מקסימלי',
    description: 'כל פרט נלקח בחשבון - מהצבעים ועד הטקסטורות',
    details: ['ניתוח צבעים מדויק', 'שמירה על טקסטורות', 'פרופורציות מושלמות']
  },
  {
    icon: Zap,
    title: 'מהירות יוצאת דופן',
    description: 'מה שלוקח לצלם שעות, אנחנו עושים תוך דקות',
    details: ['עיבוד מקבילי', 'זמן תגובה מהיר', 'אספקה מהירה']
  },
  {
    icon: Shield,
    title: 'איכות מובטחת',
    description: 'בקרת איכות מתקדמת בכל שלב של התהליך',
    details: ['בדיקה אוטומטית', 'בקרה ידנית', 'תיקונים מיידיים']
  }
];

const qualityPromises = [
  {
    icon: CheckCircle,
    title: 'איכות פוטוריאליסטית',
    description: 'תמונות שלא ניתן להבחין שהן נוצרו על ידי AI'
  },
  {
    icon: Clock,
    title: 'עמידה בזמנים',
    description: 'אספקה בזמן - תמיד. אם לא, מחזירים כסף'
  },
  {
    icon: TrendingUp,
    title: 'שיפור מתמיד',
    description: 'הטכנולוגיה שלנו משתפרת כל הזמן'
  },
  {
    icon: Award,
    title: 'שביעות רצון 100%',
    description: 'לא מרוצים? נעשה שוב עד שיהיה מושלם'
  }
];

const TechnologyQuality = () => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section 
      ref={ref}
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
            הטכנולוגיה שמאחורי הקסם
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-3xl mx-auto">
            למה התמונות שלנו כל כך טובות? כי השקענו שנים בפיתוח הטכנולוגיה המתקדמת ביותר
          </p>
        </motion.div>

        {/* Technology Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {techFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full border-border hover:shadow-elegant transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-assistant font-bold text-primary">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground font-open-sans leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                        <span className="text-sm font-open-sans text-muted-foreground">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quality Promises */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20"
        >
          <h3 className="text-3xl font-assistant font-bold text-primary text-center mb-12">
            ההתחייבות שלנו לאיכות
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityPromises.map((promise, index) => (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <promise.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h4 className="text-lg font-assistant font-bold text-primary mb-2">
                  {promise.title}
                </h4>
                
                <p className="text-sm text-muted-foreground font-open-sans leading-relaxed">
                  {promise.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: '99.9%', label: 'דיוק בתמונות' },
            { number: '< 24h', label: 'זמן אספקה ממוצע' },
            { number: '50,000+', label: 'תמונות נוצרו' },
            { number: '100%', label: 'שביעות רצון' }
          ].map((stat, index) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-assistant font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground font-open-sans">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologyQuality;