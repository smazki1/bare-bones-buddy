import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ContactFAQ = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const faqs = [
    {
      question: 'כמה זמן לוקח הפרויקט?',
      answer: 'פרויקט טיפוסי לוקח 3-7 ימי עבודה, תלוי במספר המנות ובמורכבות. פרויקטים דחופים יכולים להיות מוכנים תוך 48-72 שעות בתוספת מחיר. אנחנו תמיד נעדכן אתכם על לוח הזמנים המדויק לפני תחילת העבודה.'
    },
    {
      question: 'מה אתם צריכים ממני?',
      answer: 'אנחנו צריכים תמונות בסיסיות של המנות (אפילו מהטלפון), רשימת המנות שרוצים לצלם, ופרטים על הסגנון הרצוי. אם יש לכם תמונות קיימות - מעולה. אם לא - נסביר איך לצלם תמונות בסיסיות שיעזרו לנו ליצור את הקסם.'
    },
    {
      question: 'איך התשלום?',
      answer: 'אנחנו עובדים עם מקדמה של 50% להתחלת הפרויקט, והיתרה עם סיום העבודה ולפני אספקת התמונות הסופיות. אפשר לשלם בהעברה בנקאית, צ\'ק, או כרטיס אשראי. לפרויקטים גדולים אפשר לתאם תשלומים.'
    },
    {
      question: 'מה אם לא אהיה מרוצה?',
      answer: 'אנחנו מתחייבים לשביעות רצונכם! במהלך הפרויקט יש עד 3 סיבובי תיקונים ללא עלות נוספת. אם בסוף התהליך לא תהיו מרוצים, אנחנו נחזיר את כל הכסף - ללא שאלות ובלי להשאיר טעם רע.'
    },
    {
      question: 'איך זה עובד?',
      answer: 'התהליך פשוט: 1) אתם שולחים לנו תמונות בסיסיות ורשימת מנות 2) אנחנו מכינים הצעת מחיר מפורטת 3) לאחר אישור, אנחנו יוצרים את התמונות המקצועיות באמצעות AI מתקדם 4) אתם מקבלים את התמונות המוכנות לשימוש בכל הפלטפורמות.'
    },
    {
      question: 'האם התמונות ייראו אמיתיות?',
      answer: 'בהחלט! אנחנו משתמשים בטכנולוגיית AI מתקדמת שיוצרת תמונות פוטוריאליסטיות המבוססות על המנות האמיתיות שלכם. הלקוחות שלנו מדווחים שהתמונות נראות אפילו יותר טוב מהמנות בפועל, ומושכות הרבה יותר לקוחות.'
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-subtle">
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
                  יש לכם שאלה אחרת?
                </h3>
                <p className="text-muted-foreground font-open-sans mb-4">
                  אנחנו כאן לענות על כל שאלה נוספת
                </p>
                <a 
                  href="https://wa.me/972527772807?text=יש לי שאלה נוספת לגבי השירותים שלכם"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-assistant font-semibold transition-all duration-200 hover:scale-105"
                >
                  שלחו שאלה בוואטסאפ
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactFAQ;