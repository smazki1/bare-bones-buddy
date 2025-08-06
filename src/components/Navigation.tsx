import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'פיצ\'רים', href: '#features' },
    { name: 'פתרונות לעסקים', href: '#business' },
    { name: 'השירותים שלנו', href: '#services' },
    { name: 'צור קשר', href: '#contact' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-elegant' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Right Side in RTL */}
          <motion.a
            href="/"
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center ${
              isScrolled ? 'shadow-elegant' : 'shadow-warm'
            }`}>
              <span className="text-white font-assistant font-bold text-lg">FV</span>
            </div>
          </motion.a>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={`font-open-sans text-lg transition-colors hover:text-primary ${
                  isScrolled ? 'text-foreground' : 'text-white/90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* CTAs - Left Side in RTL */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-assistant"
              size="sm"
            >
              כניסת משתמשים
            </Button>
            <Button
              className="bg-secondary hover:bg-secondary/90 text-white font-assistant"
              size="sm"
            >
              התנסות חינם
            </Button>
          </div>

          {/* Mobile Menu Button - Far Left in RTL */}
          <div className="md:hidden order-first">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled ? 'text-foreground' : 'text-white'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden overflow-hidden ${isMobileMenuOpen ? 'max-h-80' : 'max-h-0'}`}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-4 bg-background/95 backdrop-blur-md rounded-lg mt-2" dir="rtl">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-foreground hover:text-primary font-open-sans text-right"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="px-4 space-y-2">
              <Button
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-assistant"
                size="sm"
              >
                התנסות חינם
              </Button>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-assistant"
                size="sm"
              >
                כניסת משתמשים
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation;