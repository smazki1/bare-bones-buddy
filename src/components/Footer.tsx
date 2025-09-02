import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-assistant font-bold text-secondary mb-4">
              Food Vision
            </h3>
            <p className="text-white/80 font-open-sans mb-6">
              מנות מושלמות. תמונות מושלמות.
              יוצרים תמונות AI מקצועיות למסעדות בישראל.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/+972527772807"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-assistant font-bold text-white mb-4">
              קישורים מהירים
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'דף הבית', href: '/' },
                { name: 'תיק עבודות', href: '/portfolio' },
                { name: 'שירותים', href: '/services' },
                { name: 'צור קשר', href: '/contact' },
                { name: 'מדיניות פרטיות', href: '/privacy' },
                { name: 'תנאי שימוש', href: '/terms' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-secondary font-open-sans transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-assistant font-bold text-white mb-4">
              השירותים שלנו
            </h4>
            <ul className="space-y-3">
              {[
                'תמונות AI למסעדות',
                'צילום מזון מקצועי',
                'עיצוב תפריטים',
                'תמונות לרשתות חברתיות',
                'סרטוני וידאו קצרים',
              ].map((service) => (
                <li key={service}>
                  <span className="text-white/80 font-open-sans">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-assistant font-bold text-white mb-4">
              צור קשר
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <a 
                  href="tel:+972527772807"
                  className="text-white/80 hover:text-secondary font-open-sans transition-colors duration-300"
                >
                  052-777-2807
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <a 
                  href="mailto:info@food-vision.co.il"
                  className="text-white/80 hover:text-secondary font-open-sans transition-colors duration-300"
                >
                  info@food-vision.co.il
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-white/80 font-open-sans">
                  ישראל<br />
                  שירות זמין בכל הארץ
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/20 mt-12 pt-8 text-center"
        >
          <p className="text-white/60 font-open-sans">
            © 2024 Food Vision. כל הזכויות שמורות.
          </p>
          <p className="text-white/70 font-open-sans mt-2">
            נבנה באהבה על ידי{' '}
            <a
              href="https://ai-master.co.il"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-secondary"
            >
              אבי פריד · AI MASTER
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;