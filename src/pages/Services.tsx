import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ServicesGrid from '@/components/services/ServicesGrid';
import PackagesSection from '@/components/packages/PackagesSection';
import { useEffect, useState } from 'react';
import CTASection from '@/components/CTASection';

const Services = () => {
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    // On mobile, auto-open the launch promo package modal on first render
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) setAutoOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navigation theme="light" />
      
      <main>
        <ServicesGrid />
        <PackagesSection autoOpenId={autoOpen ? 'trial' : undefined} />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;