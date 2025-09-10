import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toSupabaseRenderUrl, buildSupabaseSrcSet, isSupabasePublicUrl } from '@/utils/imageUrls';
import { Skeleton } from './skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  thumbSrc?: string; // Optional smaller version for grid display
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean; // For above-the-fold images
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2' | string;
  showSkeleton?: boolean;
  onClick?: () => void;
  blur?: boolean; // Enable blur-up effect
}

// Generate tiny blur placeholder (10px wide)
const generateBlurDataUrl = (width = 10, height = 10): string => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="0%"/>
          <stop stop-color="#e5e7eb" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`
  )}`;
};

const OptimizedImage = ({
  src,
  alt,
  className,
  thumbSrc,
  width = 800,
  height,
  quality = 78,
  priority = false,
  aspectRatio = 'square',
  showSkeleton = true,
  onClick,
  blur = true,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(blur ? generateBlurDataUrl() : '');

  // Use thumb for grid display, full image for lightbox/detail views
  const displaySrc = thumbSrc || src;
  
  // Optimize Supabase URLs or use original
  const optimizedSrc = isSupabasePublicUrl(displaySrc) 
    ? toSupabaseRenderUrl(displaySrc, { width, quality, format: 'webp' })
    : displaySrc;
    
  // Disable srcSet to prevent multiple image requests and cold starts
  const srcSet = undefined;

  const aspectClasses = {
    'square': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };

  const aspectClass = aspectClasses[aspectRatio as keyof typeof aspectClasses] || aspectRatio;

  useEffect(() => {
    if (!optimizedSrc) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(optimizedSrc);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };

    // Load image
    img.src = optimizedSrc;
    if (srcSet) {
      img.srcset = srcSet;
    }
  }, [optimizedSrc, srcSet]);

  if (hasError) {
    return (
      <div className={cn(
        "relative overflow-hidden bg-muted flex items-center justify-center",
        aspectClass,
        className
      )}>
        <div className="text-muted-foreground text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <p className="text-sm">שגיאה בטעינת התמונה</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        aspectClass,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Show skeleton while loading */}
      {!isLoaded && showSkeleton && (
        <Skeleton className={cn("absolute inset-0", aspectClass)} />
      )}
      
      {/* Optimized image */}
      <motion.img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        srcSet={srcSet}
        sizes={srcSet ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" : undefined}
        initial={{ opacity: blur ? 0 : 1, filter: blur ? "blur(10px)" : "none" }}
        animate={{ 
          opacity: isLoaded ? 1 : (blur ? 0.3 : 1),
          filter: isLoaded ? "blur(0px)" : (blur ? "blur(10px)" : "none")
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onLoad={() => {
          setIsLoaded(true);
        }}
      />
    </div>
  );
};

export { OptimizedImage };