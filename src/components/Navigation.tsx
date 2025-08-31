import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

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
    { name: 'דוגמאות', href: '/portfolio' },
    { name: 'שירותים', href: '/services' },
    { name: 'צור קשר', href: '/contact' },
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
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
            <Link to="/" aria-label="Go to home" className="block">
              <h2 className={`text-2xl font-assistant font-bold ${
                isScrolled ? 'text-primary' : 'text-white'
              }`}>
                Food Vision
              </h2>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={`font-open-sans text-lg transition-colors hover:text-secondary ${
                  isScrolled ? 'text-foreground' : 'text-white/90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
              </motion.a>
            ))}
            
            {/* WhatsApp button removed per request */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
          className={`md:hidden overflow-hidden ${isMobileMenuOpen ? 'max-h-64' : 'max-h-0'}`}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-4 bg-background/95 backdrop-blur-md rounded-lg mt-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-foreground hover:text-secondary font-open-sans"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            {/* WhatsApp button removed per request */}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation;