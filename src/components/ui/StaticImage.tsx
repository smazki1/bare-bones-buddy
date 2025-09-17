import { useState } from 'react';
import { motion } from 'framer-motion';

interface StaticImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  blur?: boolean;
  showSkeleton?: boolean;
  onClick?: () => void;
}

export function StaticImage({ 
  src, 
  alt, 
  className = "", 
  priority = false,
  blur = false,
  showSkeleton = true,
  onClick
}: StaticImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if src is valid
  if (!src || src.trim() === '') {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">אין תמונה זמינה</span>
      </div>
    );
  }

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error('Failed to load image:', src);
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">שגיאה בטעינת התמונה</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center transition-all duration-300 ${
          blur && !isLoaded ? 'blur-sm' : ''
        } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}