import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PackageItem } from './PackagesSection';

interface PackageCardProps {
  package: PackageItem;
  onClick: () => void;
}

const PackageCard = ({ package: pkg, onClick }: PackageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group cursor-pointer h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      aria-label={`פרטים על חבילת ${pkg.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="bg-card rounded-2xl overflow-hidden h-full flex flex-col border border-border/50 hover:shadow-lg transition-shadow duration-300 aspect-[4/5]">
        {/* Image/Features Area */}
        <div className="relative flex-1 overflow-hidden">
          {/* Default Image */}
          <motion.img
            src={pkg.imageSrc}
            alt={`תמונה של ${pkg.name}`}
            className="w-full h-full object-cover"
            animate={{ 
              filter: isHovered ? 'brightness(0.6)' : 'brightness(1)' 
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Features Overlay (Desktop Hover Only) */}
          <motion.div
            className="absolute inset-0 bg-primary/95 p-6 flex flex-col justify-center hidden md:flex"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
            <ul className="space-y-3 text-primary-foreground">
              {pkg.features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-3 text-sm font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : -10
                  }}
                  transition={{ 
                    duration: 0.3,
                    delay: isHovered ? index * 0.05 : 0
                  }}
                >
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pkg.subtitle}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">{pkg.price}</div>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              לפרטים נוספים
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PackageCard;