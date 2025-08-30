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
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/95 to-primary text-white flex flex-col"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Header Section */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-assistant font-bold text-center text-white mb-1">
                  חבילת {pkg.name}
                </h3>
                <p className="text-center text-white/80 text-sm font-open-sans">
                  {pkg.price}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-secondary fill-current" />
                  <Star className="w-3 h-3 text-secondary fill-current" />
                  <Star className="w-3 h-3 text-secondary fill-current" />
                  <Star className="w-3 h-3 text-secondary fill-current" />
                  <Star className="w-3 h-3 text-secondary fill-current" />
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="px-6">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-6 py-4 flex flex-col justify-center">
                {/* Delivery Info */}
                <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/90" />
                      <span className="text-white/90 text-sm font-open-sans">זמן אספקה</span>
                    </div>
                    <span className="text-white font-assistant font-bold text-sm">48-72 שעות</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {pkg.features.slice(0, 4).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-white/95"
                    >
                      <div className="w-5 h-5 rounded-full bg-secondary/90 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Check className="w-3 h-3 text-white font-bold" />
                      </div>
                      <span className="text-sm font-open-sans leading-relaxed flex-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-6 pt-2">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4"></div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
                    <span className="text-white/90 text-xs font-open-sans">לחץ לפרטים נוספים</span>
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Reduced Motion Fallback */}
        {canFlip && reducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/95 to-primary text-white flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}
          >
            {/* Header Section */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-assistant font-bold text-center text-white mb-1">
                חבילת {pkg.name}
              </h3>
              <p className="text-center text-white/80 text-sm font-open-sans">
                {pkg.price}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-3 h-3 text-secondary fill-current" />
                <Star className="w-3 h-3 text-secondary fill-current" />
                <Star className="w-3 h-3 text-secondary fill-current" />
                <Star className="w-3 h-3 text-secondary fill-current" />
                <Star className="w-3 h-3 text-secondary fill-current" />
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="px-6">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-4 flex flex-col justify-center">
              {/* Delivery Info */}
              <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/90" />
                    <span className="text-white/90 text-sm font-open-sans">זמן אספקה</span>
                  </div>
                  <span className="text-white font-assistant font-bold text-sm">48-72 שעות</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {pkg.features.slice(0, 4).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-white/95"
                  >
                    <div className="w-5 h-5 rounded-full bg-secondary/90 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-3 h-3 text-white font-bold" />
                    </div>
                    <span className="text-sm font-open-sans leading-relaxed flex-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Section */}
            <div className="p-6 pt-2">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4"></div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
                  <span className="text-white/90 text-xs font-open-sans">לחץ לפרטים נוספים</span>
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PackageCard;