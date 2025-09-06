import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PackageItem } from './PackagesSection';

interface PackageModalProps {
  package: PackageItem;
  onClose: () => void;
}

const PackageModal = ({ package: pkg, onClose }: PackageModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleWhatsApp = () => {
    const text = pkg.whatsappText || `שלום, אני מתעניין בחבילת ${pkg.name}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleImageToggle = (index: number) => {
    setShowBefore(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Pull first 3 pinned portfolio projects for examples
  const [exampleImages, setExampleImages] = useState<string[]>([]);
  const [pinnedProjects, setPinnedProjects] = useState<any[]>([]);
  const [showBefore, setShowBefore] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    let removeListener: (() => void) | null = null;

    const refreshImages = async () => {
      try {
        const { portfolioStore } = await import('@/data/portfolioStore');
        const projects = await portfolioStore.getProjects();
        console.log('PackageModal: All projects loaded:', projects.length);
        console.log('PackageModal: Sample project structure:', projects[0]);
        
        const pinned = projects.filter(p => p.pinned);
        console.log('PackageModal: Pinned projects found:', pinned.length);
        console.log('PackageModal: Pinned projects details:', pinned.map(p => ({
          id: p.id,
          businessName: p.businessName,
          imageAfter: p.imageAfter,
          imageBefore: p.imageBefore,
          pinned: p.pinned
        })));
        
        const top3 = pinned.slice(0, 3);
        setPinnedProjects(top3);
        console.log('PackageModal: Top 3 pinned selected:', top3.length);
        
        // Just store projects, we'll handle images in render
        console.log('PackageModal: Projects ready for display:', top3.length);
        
        // No need to set example images anymore
      } catch (error) {
        console.error('PackageModal: Error loading pinned projects:', error);
        setPinnedProjects([]);
      }
    };

    // Initial fetch
    refreshImages();

    // Subscribe to portfolio updates for live sync
    import('@/data/portfolioStore').then(({ PORTFOLIO_UPDATE_EVENT }) => {
      const handler = () => {
        console.log('Portfolio updated, refreshing images...');
        refreshImages();
      };
      window.addEventListener(PORTFOLIO_UPDATE_EVENT, handler as EventListener);
      removeListener = () => window.removeEventListener(PORTFOLIO_UPDATE_EVENT, handler as EventListener);
    }).catch(() => {});

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            className="relative bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-10 bg-background/80 hover:bg-background"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8">
                <div className="max-w-3xl">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{pkg.name}</h2>
                  <div className="text-4xl font-bold mb-4 text-primary-foreground/90">
                    {pkg.price}
                  </div>
                  <p className="text-lg text-primary-foreground/90 leading-relaxed">
                    {pkg.subtitle.split('\n').map((line, idx, arr) => (
                      <span key={idx}>
                        {line}
                        {idx < arr.length - 1 && <><br /></>}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Features */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-6">מה כלול בחבילה:</h3>
                  <div className="grid gap-4">
                    {pkg.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-foreground font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Example Work */}
                {pinnedProjects.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">דוגמאות לעבודות שלנו:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pinnedProjects.map((project, index) => {
                        const currentImage = showBefore[index] && project.imageBefore 
                          ? project.imageBefore 
                          : project.imageAfter;
                        
                        return (
                          <motion.div
                            key={project.id}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-card border border-border/50 shadow-md cursor-pointer group"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            onClick={() => handleImageToggle(index)}
                          >
                            <img
                              src={currentImage}
                              alt={`${project.businessName} - ${showBefore[index] ? 'לפני' : 'אחרי'}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                console.error('Failed to load image:', currentImage);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            
                            {/* Before/After Badge */}
                            {project.imageBefore && (
                              <div className="absolute top-3 right-3 bg-background/90 text-foreground border rounded-full px-2 py-1 text-xs font-medium">
                                {showBefore[index] ? 'לפני' : 'אחרי'}
                              </div>
                            )}
                            
                            {/* Project name overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <p className="text-sm font-medium text-shadow-sm">
                                {project.businessName}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Debug info (remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-gray-100 p-4 rounded-lg text-sm">
                    <p>Debug: {pinnedProjects.length} pinned projects found</p>
                  </div>
                )}

                {/* CTA */}
                <motion.div
                  className="relative p-[2px] rounded-2xl bg-gradient-to-r from-secondary/60 via-primary to-secondary/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 p-6 md:p-8 text-center">
                    <motion.h3 
                      className="text-2xl font-bold text-foreground mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      מוכנים להתחיל?
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground mb-6 text-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      צרו איתנו קשר עכשיו ונתחיל לעבוד על הפרויקט שלכם
                    </motion.p>

                    

                    <div className="flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={handleWhatsApp}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8 shadow-elegant hover:shadow-warm"
                      >
                        <MessageCircle className="w-5 h-5" />
                        בואו נדבר
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PackageModal;