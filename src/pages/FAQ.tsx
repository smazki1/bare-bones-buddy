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
import { Camera, Palette, Users, Zap, Target, CheckCircle2, Clock, Phone } from 'lucide-react';

const FAQ = () => {
  const { ref: faqRef, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const { ref: processRef, isIntersecting: processIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const { ref: benefitsRef, isIntersecting: benefitsIntersecting } = useIntersectionObserver({ threshold: 0.2 });

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
      question: 'איך אתם מבטיחים שהתמונות יראו אמיתיות?',
      answer: 'יש לנו תהליך בקרת איכות מחמיר: כל תמונה עוברת בדיקה ידנית של מומחה, אנחנו משתמשים בטכנולוגיית AI המתמחה במזון, ודואגים שכל פרט - הצללים, התאורה, והרכיבים - ייראה טבעי ומושך.'
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
      question: 'מה עם מנות מורכבות או מיוחדות?',
      answer: 'זה בדיוק המקום שבו אנחנו מצטיינים! מנות מורכבות, מיוחדות, או עונתיות - הטכנולוגיה שלנו יכולה להתמודד עם כל סוג של מנה. אנחנו כבר עבדנו עם מנות מרוקאיות, יפניות, טבעוניות, וכל מה שביניהן.'
    },
    {
      question: 'האם זה מתאים לרשת עם כמה סניפים?',
      answer: 'בהחלט! אנחנו מתמחים ברשתות מזון ובעלי כמה סניפים. התמונות נבנות פעם אחת ויכולות לשמש את כל הסניפים. יש לנו מחירים מיוחדים לרשתות ואפשרויות ניהול מרכזי של כל התמונות.'
    },
    {
      question: 'אילו פלטפורמות נתמכות?',
      answer: 'התמונות מותאמות לכל הפלטפורמות: אתרים, אפליקציות משלוחים (וולט, 10ביס, גט), רשתות חברתיות (אינסטגרם, פייסבוק, טיקטוק), תפריטים דיגיטליים, ומודעות. אנחנו מספקים כמה גרסאות של כל תמונה.'
    },
    {
      question: 'למי שייכות זכויות השימוש?',
      answer: 'זכויות השימוש שייכות לכם במלואן! אתם יכולים להשתמש בתמונות כמה שאתם רוצים, לערוך אותן, ואפילו להעביר אותן לסוכנות השיווק שלכם. אין הגבלות זמן או שימוש.'
    },
    {
      question: 'מה לגבי מנות מורכבות (קריסטלים, עשן, גובה רב)?',
      answer: 'הטכנולוגיה שלנו מסוגלת ליצור אפקטים מיוחדים כמו עשן מסתובב, מרקמים מורכבים, ואפילו מנות בגובה רב או בזוויות מיוחדות. אנחנו יכולים להוסיף אפקטים ויזואליים שקשה להשיג אפילו בצילום רגיל.'
    },
    {
      question: 'האם יש סיכון שהתוצאה לא תהיה משביעת רצון?',
      answer: 'אנו מפעילים בקרת איכות ידנית ומתחרים בעצמנו מול סטנדרטים של צלמי מזון מקצועיים. במקרה נדיר של תוצאה לא משביעת רצון, ניצור גרסה חדשה על חשבוננו או נחזיר את הכסף במלואו.'
    },
    {
      question: 'אני סוכנות שיווק. איך השירות שלכם משתלב בתהליך העבודה שלי מול לקוחות?',
      answer: 'אנחנו עובדים עם הרבה סוכנויות שיווק! אתם יכולים להציג את השירות ללקוחות, לנהל את התהליך בשמם, ואנחנו נספק לכם תמחור מיוחד וכלים לניהול פרויקטים מרובים. יש לנו ממשק מיוחד לסוכנויות.'
    },
    {
      question: 'האם אני יכול למכור את השירות שלכם הלאה ללקוחות שלי (Resell)?',
      answer: 'כן! יש לנו תוכנית שותפים מיוחדת לסוכנויות ויועצים עסקיים. אתם יכולים להציע את השירות ללקוחות שלכם עם המרווח שלכם. נספק לכם חומרי שיווק, תמיכה טכנית, ומחירים מיוחדים.'
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
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-assistant font-bold text-primary mb-6">
                איך זה עובד
              </h1>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                כל מה שאתם צריכים לדעת על השירות שלנו
              </p>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section ref={processRef} className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={processIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
                מצילום בטלפון לסטודיו מקצועי
              </h2>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                התהליך שחוסך לכם זמן, כסף ועצבים
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-12">
              {/* הנוסחה המנצחת */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={processIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-8 shadow-elegant"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-assistant font-bold text-primary mb-4 flex items-center justify-center gap-3">
                    🔥 הנוסחה המנצחת
                  </h3>
                  <p className="text-lg font-open-sans text-foreground leading-relaxed">
                    <strong>10-15 תמונות מזוויות מגוונות = תוצאות מרהיבות.</strong> זה הסוד. ככל שהתמונות יותר שונות זו מזו (זוויות, תאורות, רקעים), כך ה-AI שלנו יוצר תוצאות יותר מדהימות.
                  </p>
                </div>
              </motion.div>

              {/* הצילום */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={processIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-3xl font-assistant font-bold text-primary mb-4 flex items-center gap-3">
                    📱 הצילום: פשוט וחכם
                  </h3>
                  <p className="text-lg font-open-sans text-muted-foreground leading-relaxed">
                    בטלפון, במטבח, בחנות - לא משנה איפה. רק וודאו שהמנה/מוצר נראה אטרקטיבי ושיש מגוון. אנחנו נספק הדרכה מדויקת איך לצלם.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 flex items-center justify-center">
                  <Phone className="w-20 h-20 text-blue-500" />
                </div>
              </motion.div>

              {/* הסגנון */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={processIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="order-2 md:order-1">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 flex items-center justify-center">
                    <Palette className="w-20 h-20 text-purple-500" />
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-3xl font-assistant font-bold text-primary mb-4 flex items-center gap-3">
                    🎨 הסגנון: שלכם לחלוטין
                  </h3>
                  <p className="text-lg font-open-sans text-muted-foreground leading-relaxed">
                    בחרו מהמאגר שלנו או העלו השראות משלכם. אנחנו מתאימים בדיוק לזהות המותג שלכם.
                  </p>
                </div>
              </motion.div>

              {/* הייעוץ */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={processIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-3xl font-assistant font-bold text-primary mb-4 flex items-center gap-3">
                    👨‍🎨 הייעוץ: אישי ומקצועי
                  </h3>
                  <p className="text-lg font-open-sans text-muted-foreground leading-relaxed">
                    פגישה עם המעצב שלנו להבטיח שהתוצאה תהיה בדיוק מה שאתם רוצים.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 flex items-center justify-center">
                  <Users className="w-20 h-20 text-green-500" />
                </div>
              </motion.div>

              {/* התוצאה */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={processIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-secondary/15 to-primary/15 rounded-3xl p-8 shadow-elegant text-center"
              >
                <h3 className="text-3xl font-assistant font-bold text-primary mb-4 flex items-center justify-center gap-3">
                  ⚡ התוצאה: מהירה ומרשימה
                </h3>
                <p className="text-lg font-open-sans text-foreground leading-relaxed max-w-3xl mx-auto">
                  ימים ספורים ויש לכם ספרייה של תמונות ברמת סטודיו. <strong>לכל מטרה, לכל פלטפורמה, לכל עונה.</strong>
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Food Vision Section */}
        <section ref={benefitsRef} className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={benefitsIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
                למה FoodVision?
              </h2>
              <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
                השירות המושלם עבור עסקי המזון במאה ה-21
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
                className="bg-card rounded-2xl p-8 shadow-elegant text-center"
              >
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-assistant font-bold text-foreground mb-4">
                  מותאם מושלם לעולם המשלוחים
                </h3>
                <p className="text-muted-foreground font-open-sans leading-relaxed">
                  מכירות גבוהות יותר בוולט, 10ביס וכל אפליקציות המשלוחים
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-elegant text-center"
              >
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-assistant font-bold text-foreground mb-4">
                  תוצאות מבוססות מנות אמיתיות
                </h3>
                <p className="text-muted-foreground font-open-sans leading-relaxed">
                  לא תמונות "מזויפות" - אלא שדרוג מקצועי של המנות שלכם
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card rounded-2xl p-8 shadow-elegant text-center"
              >
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-assistant font-bold text-foreground mb-4">
                  מהיר פי 10 מצלם רגיל
                </h3>
                <p className="text-muted-foreground font-open-sans leading-relaxed">
                  48 שעות במקום שבועות של תיאומים וצילומים
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-20">
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
                      בואו נתחיל ליצור תמונות מושלמות למסעדה שלכם
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