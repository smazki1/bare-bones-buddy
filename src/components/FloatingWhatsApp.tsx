import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from './ui/button';

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 3 seconds, hide after 5 seconds
    const showTimer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '+972527772807';
    const message = encodeURIComponent('שלום! אני מעוניין לשמוע עוד על שירותי Food Vision');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            className="absolute bottom-20 left-0 bg-white rounded-lg shadow-elegant p-4 max-w-xs mb-2 border border-border"
          >
            <div className="relative">
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
              <p className="text-sm font-open-sans text-foreground pr-4">
                💬 <strong>יש שאלות?</strong><br />
                צור קשר ב-WhatsApp לייעוץ מהיר וחינם!
              </p>
            </div>
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-r border-b border-border transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={handleWhatsAppClick}
          className="w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-warm border-4 border-white relative overflow-hidden group"
          aria-label="צור קשר ב-WhatsApp"
        >
          <MessageCircle className="w-8 h-8" />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
        </Button>

        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" />
      </motion.div>
    </div>
  );
};

export default FloatingWhatsApp;