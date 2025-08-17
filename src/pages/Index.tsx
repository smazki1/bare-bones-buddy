import HeroSection from '@/components/HeroSection';
import BusinessSolutionsSection from '@/components/solutions/BusinessSolutionsSection';
import FeatureWorkSection from '@/components/FeatureWorkSection';
import ProductsSection from '@/components/ProductsSection';
import PortfolioSection from '@/components/PortfolioSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import SectorsSection from '@/components/SectorsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <BusinessSolutionsSection />
      <FeatureWorkSection />
      <ProductsSection />
      <PortfolioSection />
      <TestimonialsSection />
      <SectorsSection />
      <CTASection />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
