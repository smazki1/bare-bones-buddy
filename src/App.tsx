import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import AdminIndex from "./pages/admin/index";
import AdminSolutions from "./pages/admin/solutions";
import AdminVisualSolutions from "./pages/admin/visualSolutions";
import AdminMarkets from "./pages/admin/markets";
import AdminPortfolio from "./pages/admin/portfolio";
import AdminClients from "./pages/admin/clients";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/solutions" element={<AdminSolutions />} />
          <Route path="/admin/visual-solutions" element={<AdminVisualSolutions />} />
          <Route path="/admin/markets" element={<AdminMarkets />} />
          <Route path="/admin/portfolio" element={<AdminPortfolio />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
