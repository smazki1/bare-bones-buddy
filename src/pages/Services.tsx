import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';
import ServiceHero from '@/components/services/ServiceHero';
import ServicesGrid from '@/components/services/ServicesGrid';
import CTASection from '@/components/CTASection';

const Services = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navigation />
      <FloatingWhatsApp />
      
      <main>
        <ServiceHero />
        <ServicesGrid />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;