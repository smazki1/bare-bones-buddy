import HeroSection from '@/components/HeroSection';
import BusinessSolutionsSection from '@/components/solutions/BusinessSolutionsSection';
// import PackagesSection from '@/components/packages/PackagesSection';
import VisualSolutionsSection from '@/components/VisualSolutionsSection';
import SectorsSection from '@/components/SectorsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <BusinessSolutionsSection />
      <VisualSolutionsSection />
      {/* PackagesSection hidden per request */}
      <SectorsSection />
      <CTASection />
      <Footer />
      {/* Floating WhatsApp removed per request */}
    </div>
  );
};

export default Index;
