import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContactHero from '@/components/contact/ContactHero';
import ContactMethods from '@/components/contact/ContactMethods';
import ContactForm from '@/components/contact/ContactForm';
// Removed extra sections per request

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ContactHero />
      <ContactMethods />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Contact;