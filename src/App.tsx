import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import AdminIndex from "./pages/admin/index";
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminClients from "./pages/admin/clients";
import AdminTestimonials from "./pages/admin/testimonials";
import AdminSettings from "./pages/admin/settings";
import AdminFAQ from "./pages/admin/faq";
import AdminProjects from "./pages/admin/projects";
import AdminCategories from "./pages/admin/categories";
import AdminServices from "./pages/admin/services";
import AdminContent from "./pages/admin/content";
import AdminHeroImages from "./pages/admin/hero-images";
import VisualSolutionsAdmin from "./pages/admin/visual-solutions";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { RequireAdmin } from "@/components/admin/RequireAdmin";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<RequireAdmin />}> 
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/faq" element={<AdminFAQ />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/hero-images" element={<AdminHeroImages />} />
            <Route path="/admin/visual-solutions" element={<VisualSolutionsAdmin />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
