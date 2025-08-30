import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PackageItem } from './PackagesSection';
import { canHover, hasReducedMotion } from '@/utils/device';

interface PackageCardProps {
  package: PackageItem;
  onClick: () => void;
}

const PackageCard = ({ package: pkg, onClick }: PackageCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [canFlip, setCanFlip] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setCanFlip(canHover());
    setReducedMotion(hasReducedMotion());
  }, []);

  const handleMouseEnter = () => {
    if (canFlip && !reducedMotion) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (canFlip && !reducedMotion) {
      setIsFlipped(false);
    }
  };

  const handleFocus = () => {
    if (canFlip && !reducedMotion) {
      setIsFlipped(true);
    }
  };

  const handleBlur = () => {
    if (canFlip && !reducedMotion) {
      setIsFlipped(false);
    }
  };

  return (
    <motion.div
      className="group cursor-pointer h-full"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      whileHover={canFlip ? {} : { scale: 1.02 }}
      transition={{ duration: 0.5 }}
      aria-label={`פרטים על חבילת ${pkg.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ perspective: '1200px' }}
    >
      <div className="rounded-2xl overflow-hidden h-full shadow-elegant hover:shadow-warm transition-all duration-500 group-hover:scale-105 aspect-[4/5] relative">
        {/* 3D Card Inner Wrapper */}
        <div 
          className={`w-full h-full relative transition-transform duration-300 ${
            canFlip && !reducedMotion ? 'transform-gpu' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped && canFlip && !reducedMotion ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Face */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Full-bleed Image */}
            <img
              src={pkg.imageSrc}
              alt={`תמונה של ${pkg.name}`}
              className="w-full h-full object-cover"
            />
            
            {/* Bottom Overlay with Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-xl font-bold mb-2 text-shadow-sm">{pkg.name}</h3>
              <p className="text-sm text-white/90 line-clamp-2 text-shadow-sm">
                {pkg.subtitle}
              </p>
            </div>
          </div>

          {/* Back Face (Desktop Hover Only) */}
          {canFlip && (
            <div 
              className="absolute inset-0 w-full h-full bg-primary/95 flex flex-col justify-center p-6"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <ul className="space-y-4 text-primary-foreground">
                {pkg.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Reduced Motion Fallback */}
        {canFlip && reducedMotion && (
          <motion.div
            className="absolute inset-0 bg-primary/95 p-6 flex flex-col justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}
          >
            <ul className="space-y-4 text-primary-foreground">
              {pkg.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PackageCard;