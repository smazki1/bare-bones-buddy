import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';
import ServiceHero from '@/components/services/ServiceHero';
import ServicesGrid from '@/components/services/ServicesGrid';
import ProcessSection from '@/components/services/ProcessSection';
import PricingTables from '@/components/services/PricingTables';
import BeforeAfterGallery from '@/components/services/BeforeAfterGallery';
import IndustriesServed from '@/components/services/IndustriesServed';
import TechnologyQuality from '@/components/services/TechnologyQuality';
import GuaranteesSection from '@/components/services/GuaranteesSection';
import CustomSolutions from '@/components/services/CustomSolutions';

const Services = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navigation />
      <FloatingWhatsApp />
      
      <main>
        <ServiceHero />
        <ServicesGrid />
        <ProcessSection />
        <PricingTables />
        <BeforeAfterGallery />
        <IndustriesServed />
        <TechnologyQuality />
        <GuaranteesSection />
        <CustomSolutions />
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;