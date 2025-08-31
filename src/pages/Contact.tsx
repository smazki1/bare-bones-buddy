import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContactHero from '@/components/contact/ContactHero';
import ContactMethods from '@/components/contact/ContactMethods';
import ContactForm from '@/components/contact/ContactForm';
import PricingEstimator from '@/components/contact/PricingEstimator';
import ContactFAQ from '@/components/contact/ContactFAQ';
import BusinessHours from '@/components/contact/BusinessHours';
import ProcessOverview from '@/components/contact/ProcessOverview';
import SuccessStories from '@/components/contact/SuccessStories';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ContactHero />
      <ContactMethods />
      <ContactForm />
      <PricingEstimator />
      <ProcessOverview />
      <ContactFAQ />
      <BusinessHours />
      <SuccessStories />
      <Footer />
    </div>
  );
};

export default Contact;