import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Camera, Clock, Star } from 'lucide-react';
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
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/90 to-primary flex flex-col p-6"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Header with Title and Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-assistant font-bold text-white">
                      חבילת {pkg.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-secondary fill-current" />
                      <Star className="w-3 h-3 text-secondary fill-current" />
                      <Star className="w-3 h-3 text-secondary fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  {/* Price/Time Info */}
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-white/80" />
                      <span className="text-white/90 text-xs font-open-sans">זמן אספקה</span>
                    </div>
                    <span className="text-white font-assistant font-semibold">48-72 שעות</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-white/95"
                      >
                        <div className="w-5 h-5 rounded-full bg-secondary/80 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-open-sans leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <span className="text-white/80 text-xs font-open-sans">לחץ לפרטים נוספים</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Reduced Motion Fallback */}
        {canFlip && reducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary p-6 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}
          >
            {/* Header with Title and Icon */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-assistant font-bold text-white">
                    חבילת {pkg.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-secondary fill-current" />
                    <Star className="w-3 h-3 text-secondary fill-current" />
                    <Star className="w-3 h-3 text-secondary fill-current" />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                {/* Price/Time Info */}
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-white/80" />
                    <span className="text-white/90 text-xs font-open-sans">זמן אספקה</span>
                  </div>
                  <span className="text-white font-assistant font-semibold">48-72 שעות</span>
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-white/95"
                    >
                      <div className="w-5 h-5 rounded-full bg-secondary/80 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-open-sans leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <span className="text-white/80 text-xs font-open-sans">לחץ לפרטים נוספים</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PackageCard;