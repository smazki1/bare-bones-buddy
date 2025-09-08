// Image optimization utilities for Food Vision
// Based on the analysis and optimization plan

/**
 * Image sizes for different display contexts
 */
export const IMAGE_SIZES = {
  thumb: { width: 400, quality: 70 },
  grid: { width: 600, quality: 75 },
  detail: { width: 1200, quality: 80 },
  hero: { width: 1920, quality: 85 },
} as const;

/**
 * Responsive breakpoints for srcSet generation
 */
export const RESPONSIVE_WIDTHS = [400, 600, 900, 1200, 1600] as const;

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizesAttribute = (context: 'grid' | 'hero' | 'detail' = 'grid'): string => {
  switch (context) {
    case 'hero':
      return '100vw';
    case 'detail':
      return '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw';
    case 'grid':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
};

/**
 * Performance-optimized loading strategy
 */
export const getLoadingStrategy = (
  index: number, 
  context: 'hero' | 'above-fold' | 'grid' = 'grid'
): { loading: 'eager' | 'lazy'; fetchPriority: 'high' | 'auto'; priority: boolean } => {
  switch (context) {
    case 'hero':
      return { loading: 'eager', fetchPriority: 'high', priority: true };
    case 'above-fold':
      return { 
        loading: index < 4 ? 'eager' : 'lazy', 
        fetchPriority: index < 2 ? 'high' : 'auto',
        priority: index < 4
      };
    case 'grid':
    default:
      return { 
        loading: index < 6 ? 'eager' : 'lazy', 
        fetchPriority: index < 3 ? 'high' : 'auto',
        priority: index < 6
      };
  }
};

/**
 * Aspect ratio utilities
 */
export const ASPECT_RATIOS = {
  square: '1:1',
  portrait: '3:4',
  landscape: '4:3',
  wide: '16:9',
  ultrawide: '21:9',
} as const;

/**
 * Generate blur placeholder data URL
 */
export const generateBlurPlaceholder = (width = 10, height = 10, color1 = '#f3f4f6', color2 = '#e5e7eb'): string => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="${color1}" offset="0%"/>
          <stop stop-color="${color2}" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`
  )}`;
};

/**
 * Image format detection and optimization
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR fallback
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false; // Conservative SSR fallback
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
};

/**
 * Performance monitoring utilities
 */
export const measureImageLoadTime = (src: string): Promise<number> => {
  return new Promise((resolve) => {
    const start = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - start;
      resolve(loadTime);
    };
    
    img.onerror = () => {
      resolve(-1); // Error indicator
    };
    
    img.src = src;
  });
};

/**
 * Best practices checklist for image optimization
 */
export const IMAGE_OPTIMIZATION_CHECKLIST = {
  lazyLoading: "✅ Use loading='lazy' for below-the-fold images",
  aspectRatio: "✅ Set fixed aspect-ratio containers to prevent CLS",
  skeletons: "✅ Show skeleton loaders during image loading",
  responsiveImages: "✅ Use srcSet + sizes for responsive delivery",
  modernFormats: "✅ Serve WebP/AVIF when supported",
  preconnect: "✅ Add preconnect hints for image CDN domains",
  blurUp: "✅ Use blur-up placeholder for smooth loading",
  prioritization: "✅ Set fetchPriority='high' for critical images",
  errorHandling: "✅ Provide fallbacks for failed image loads",
  performance: "✅ Monitor Core Web Vitals (LCP, CLS, FID)",
} as const;

export default {
  IMAGE_SIZES,
  RESPONSIVE_WIDTHS,
  generateSizesAttribute,
  getLoadingStrategy,
  ASPECT_RATIOS,
  generateBlurPlaceholder,
  supportsWebP,
  supportsAVIF,
  measureImageLoadTime,
  IMAGE_OPTIMIZATION_CHECKLIST,
};