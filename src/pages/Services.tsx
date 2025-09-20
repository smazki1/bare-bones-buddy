import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ServicesGrid from '@/components/services/ServicesGrid';
import VisualSolutionsSection from '@/components/VisualSolutionsSection';
import CTASection from '@/components/CTASection';

const Services = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navigation theme="light" />
      
      <main>
        <ServicesGrid />
        <VisualSolutionsSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;