import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navigation theme="light" />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-assistant font-bold text-primary mb-6">תנאי שימוש</h1>

        <section className="space-y-4 font-open-sans leading-8">
          <p>ברוכים הבאים לאתר food-vision.co.il (להלן: "האתר"). האתר מופעל על ידי ai-master.co.il (להלן: "החברה" או "אנחנו"). השימוש באתר כפוף לתנאים המפורטים להלן.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">1. כללי</h2>
          <p>השימוש באתר מעיד על הסכמתכם לתנאי שימוש אלה במלואם.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">2. השירותים המוצעים</h2>
          <ul className="list-disc pr-6 space-y-1">
            <li>צילומי מנות למסעדות</li>
            <li>צילום לרשתות חברתיות</li>
            <li>צילום לתפריטים</li>
            <li>צילום לאירועים מיוחדים</li>
          </ul>

          <h2 className="text-2xl font-assistant font-semibold mt-8">3. זכויות יוצרים וקניין רוחני</h2>
          <p>כל התכנים באתר, לרבות תמונות, טקסטים, סימני מסחר וזכויות יוצרים, הינם רכושה הבלעדי של החברה או של צדדים שלישיים שהעניקו לחברה רישיון שימוש בהם. אין להעתיק, לשכפל, להפיץ, למכור או לעשות כל שימוש מסחרי בתכנים אלה ללא הסכמה מפורשת בכתב מהחברה.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">4. הזמנת שירותים ותשלומים</h2>
          <ul className="list-disc pr-6 space-y-1">
            <li>התשלום יתבצע מראש או על פי הסכם ספציפי</li>
            <li>מחירי השירותים כוללים מע"מ כחוק</li>
            <li>ביטול הזמנה יתבצע בהתאם לחוק הגנת הצרכן</li>
            <li>תיאום מועד הצילומים ייעשה בתיאום מראש</li>
          </ul>

          <h2 className="text-2xl font-assistant font-semibold mt-8">5. פרטיות ואבטחת מידע</h2>
          <p>אנו מתחייבים לשמור על פרטיות המשתמשים באתר בהתאם למדיניות הפרטיות שלנו ולחוק הגנת הפרטיות. המידע שנאסף משמש אותנו לצורך מתן השירות ושיפורו בלבד.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">6. אחריות ושיפוי</h2>
          <p>השימוש באתר הינו באחריות המשתמש בלבד. החברה לא תישא באחריות לכל נזק ישיר או עקיף שייגרם כתוצאה משימוש באתר או מהסתמכות על המידע המופיע בו.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">7. שינויים בתנאי השימוש</h2>
          <p>החברה שומרת לעצמה את הזכות לשנות את תנאי השימוש בכל עת, לפי שיקול דעתה הבלעדי. שינויים אלו ייכנסו לתוקף מיד עם פרסומם באתר.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">8. יצירת קשר</h2>
          <p>לכל שאלה או בירור בנוגע לתנאי השימוש, ניתן ליצור קשר באמצעות טופס יצירת הקשר באתר או בדוא"ל.</p>

          <h2 className="text-2xl font-assistant font-semibold mt-8">9. סמכות שיפוט</h2>
          <p>על תנאי שימוש אלה יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית בכל עניין הנוגע לתנאי שימוש אלה תהא נתונה לבתי המשפט המוסמכים במחוז תל אביב-יפו.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;


