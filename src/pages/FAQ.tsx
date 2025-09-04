import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Camera, Sparkles, Shield, Zap, Flame, Phone, Palette, Users, Rocket, TrendingUp, PackageCheck, Upload, Eye, Download } from 'lucide-react';
import { } from 'react';

const FAQ = () => {
  const { ref: faqRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: processRef, isIntersecting: processIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: whyRef, isIntersecting: whyIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const faqs = [
    {
      question: 'האם התמונות באמת נראות אמיתיות?',
      answer: 'כן! התמונות שלנו נראות אמיתיות לחלוטין. אנחנו משתמשים בטכנולוגיית AI מתקדמת ששומרת על הפרטים הקטנים ביותר של המנה - הטקסטורות, הצבעים, והרכיבים. הלקוחות שלנו מדווחים שהתמונות נראות טוב יותר ממנות אמיתיות!'
    },
    {
      question: 'איך אני יודע שהלקוחות לא יבחינו שזה טכנולוגיה מתקדמת?',
      answer: 'הטכנולוגיה שלנו מבוססת על אלגוריתמים מתקדמים שיוצרים תמונות פוטוריאליסטיות. התמונות עוברות בקרת איכות ידנית מקפידה, ואנחנו דואגים שכל תמונה תראה כמו צולמה על ידי צלם מקצועי. הלקוחות שלכם יראו רק תמונות יפות של המנות.'
    },
    {
      question: 'האם התמונות מאושרות לשימוש בוולט ו-10ביס?',
      answer: 'בהחלט! התמונות שלנו עומדות בסטנדרטים הטכניים של כל הפלטפורמות - וולט, 10ביס, גט, דומינוס, ואתרי משלוחים אחרים. אנחנו מייצרים את התמונות ברזולוציה גבוהה ובפורמטים מותאמים לכל פלטפורמה.'
    },
    {
      question: 'כמה זה עולה בהשוואה לצלם?',
      answer: 'השירות שלנו עולה כ-80% פחות מצלם מקצועי! במקום לשלם אלפי שקלים על יום צילומים, תקבלו תמונות מקצועיות תוך ימים ספורים במחיר שמתחיל מ-99₪ לתמונה בודדת. זה חיסכון משמעותי בזמן ובכסף.'
    },
    {
      question: 'מה קורה אם אני לא מרוצה?',
      answer: 'יש לנו מדיניות החזר כספי מלא! אם לא תהיו מרוצים מהתוצאה הסופית, אנחנו מחזירים את כל הכסף ללא שאלות. בנוסף, במהלך התהליך יש עד 3 סיבובי תיקונים חינם כדי לוודא שתקבלו בדיוק מה שרציתם.'
    },
    {
      question: 'איזה חומרים אני צריך לספק?',
      answer: 'אתם צריכים לשלוח לנו תמונות בסיסיות של המנות (אפילו מהטלפון), רשימת המנות שרוצים לצלם, ופרטים על הסגנון הרצוי. אם יש לכם תמונות קיימות - נהדר. אם לא - אנחנו נסביר איך לצלם תמונות פשוטות שיעזרו לנו.'
    },
    {
      question: 'האם זה מתאים לרשת עם כמה סניפים?',
      answer: 'בהחלט! אנחנו מתמחים ברשתות מזון ובעלי כמה סניפים. התמונות נבנות פעם אחת ויכולות לשמש את כל הסניפים. יש לנו מחירים מיוחדים לרשתות ואפשרויות ניהול מרכזי של כל התמונות.'
    },
    {
      question: 'למי שייכות זכויות השימוש?',
      answer: 'זכויות השימוש שייכות לכם במלואן! אתם יכולים להשתמש בתמונות כמה שאתם רוצים, לערוך אותן, ואפילו להעביר אותן לסוכנות השיווק שלכם. אין הגבלות זמן או שימוש.'
    },
    {
      question: 'אני סוכנות שיווק. איך השירות שלכם משתלב בתהליך העבודה שלי מול לקוחות?',
      answer: 'אנחנו עובדים עם הרבה סוכנויות שיווק! אתם יכולים להציג את השירות ללקוחות, לנהל את התהליך בשמם, ואנחנו נספק לכם תמחור מיוחד וכלים לניהול פרויקטים מרובים. יש לנו ממשק מיוחד לסוכנויות.'
    }
  ];

  const processSteps = [
    {
      icon: <Upload className="w-12 h-12" />,
      title: "העלאת התמונות",
      description: "4-6 תמונות מזוויות שונות של המנה שלכם",
      step: "01",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Eye className="w-12 h-12" />,
      title: "בחירת סגנון ופורמט",
      description: "מהמאגר שלנו או העלו השראה משלכם",
      step: "02",
      color: "from-green-500 to-blue-600"
    },
    {
      icon: <Download className="w-12 h-12" />,
      title: "קבלת התמונות",
      description: "תוך 48-72 שעות - מוכנות לכל שימוש",
      step: "03",
      color: "from-orange-500 to-red-600"
    }
  ];

  const whyFoodVisionPoints = [
    {
      icon: <TrendingUp className="w-10 h-10 text-secondary" />,
      title: 'מכירות גבוהות יותר במשלוחים',
      description: 'התמונות שלנו מותאמות בצורה מושלמת לוולט, 10ביס וכל אפליקציות המשלוחים, כדי למשוך את העין ולהגדיל את יחס ההמרה וההזמנות.'
    },
    {
      icon: <PackageCheck className="w-10 h-10 text-secondary" />,
      title: 'תוצאות מבוססות מנות אמיתיות',
      description: 'זה לא תמונות "מזויפות" או גנריות. אנחנו לוקחים את המנות האמיתיות שלכם ומשדרגים אותן לרמה מקצועית, תוך שמירה על האופי והייחודיות שלהן.'
    },
    {
      icon: <Zap className="w-10 h-10 text-secondary" />,
      title: 'מהיר פי 10 מצלם רגיל',
      description: 'קבלו גלריה שלמה של תמונות מוכנות תוך 48-72 שעות בלבד. תשכחו משבועות של תיאומים, צילומים ועריכות אינסופיות.'
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation theme="light" />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-assistant font-bold text-primary mb-6">
                מצילום בטלפון לסטודיו מקצועי
              </h1>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                התהליך שחוסך לכם זמן, כסף ועצבים
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section - Vertical Timeline */}
        <section ref={processRef} className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={processIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-6">
                איך זה עובד?
              </h2>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                3 שלבים פשוטים לתמונות מושלמות
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {/* Vertical line */}
              <div className="relative">
                <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary/20 via-primary/20 to-secondary/20" aria-hidden="true"></div>
                <div className="space-y-10">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative pr-24"
                    >
                      {/* Icon circle */}
                      <div className="absolute right-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary text-white flex items-center justify-center shadow-lg ring-8 ring-background">
                        {step.icon}
                      </div>
                      {/* Card content */}
                      <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant text-right">
                        <div className="text-xs text-muted-foreground font-assistant mb-2">שלב {step.step}</div>
                        <h3 className="text-2xl font-assistant font-bold text-primary mb-2">{step.title}</h3>
                        <p className="text-muted-foreground font-open-sans leading-relaxed">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why FoodVision Section */}
        <section ref={whyRef} className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={whyIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
                למה FoodVision?
              </h2>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                מותאם מושלם לעולם המשלוחים והשיווק הדיגיטלי
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {whyFoodVisionPoints.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={whyIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border text-center"
                >
                  <div className="inline-flex items-center justify-center p-4 bg-secondary/10 rounded-full mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-assistant font-bold text-primary mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground font-open-sans leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
                שאלות נפוצות
              </h2>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                כל מה שרציתם לדעת על התהליך והשירות שלנו
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-card rounded-2xl p-8 shadow-elegant">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-right font-assistant font-semibold text-lg hover:text-secondary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-right font-open-sans text-muted-foreground leading-relaxed pt-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="mt-12 text-center">
                  <div className="bg-secondary/5 rounded-xl p-6">
                    <h3 className="text-xl font-assistant font-bold text-foreground mb-2">
                      מוכנים להתחיל?
                    </h3>
                    <p className="text-muted-foreground font-open-sans mb-4">
                      בואו ניצור תמונות מושלמות שיזניקו לכם את המכירות
                    </p>
                    <a 
                      href="https://wa.me/972527772807?text=אני מעוניין לשמוע עוד על השירות שלכם"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-lg font-assistant font-bold text-lg transition-all duration-200 hover:scale-105"
                    >
                      בואו נתחיל!
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;