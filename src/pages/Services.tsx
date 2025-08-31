import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ServicesGrid from '@/components/services/ServicesGrid';
import CTASection from '@/components/CTASection';

const Services = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navigation />
      
      <main>
        <ServicesGrid />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;