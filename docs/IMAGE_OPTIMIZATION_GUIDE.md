# Image Optimization Guide - Food Vision

## Overview

This guide documents the comprehensive image optimization system implemented in Food Vision, designed to achieve instant-loading images and perfect user experience.

## 🚀 Key Performance Features

### 1. Lazy Loading + Fixed Layout
```tsx
// ❌ Wrong - causes layout shifts
<img src="image.jpg" alt="Food" loading="lazy" />

// ✅ Correct - stable layout with lazy loading
<div className="aspect-square">
  <OptimizedImage 
    src="image.jpg" 
    alt="Food" 
    aspectRatio="square"
    loading="lazy" 
  />
</div>
```

### 2. Skeleton Loading
```tsx
// Show skeleton while loading
{!isLoaded && <Skeleton className="aspect-square" />}
```

### 3. Responsive Images with srcSet
```tsx
<OptimizedImage
  src="image.jpg"
  srcSet="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### 4. Supabase Storage Optimization
```tsx
// Automatic WebP conversion and sizing
const optimizedUrl = toSupabaseRenderUrl(originalUrl, {
  width: 800,
  quality: 78,
  format: 'webp'
});
```

### 5. Blur-up Placeholders
```tsx
<OptimizedImage
  src="full-image.jpg"
  blur={true} // Enables blur-up effect
  quality={78}
/>
```

## 🎯 Performance Strategy

### Loading Priorities
- **Hero images**: `loading="eager"` + `fetchPriority="high"`
- **Above-the-fold**: First 4-6 images load eagerly
- **Below-the-fold**: `loading="lazy"` for everything else

### Image Sizes by Context
```tsx
const IMAGE_SIZES = {
  thumb: { width: 400, quality: 70 },   // Grid thumbnails
  grid: { width: 600, quality: 75 },    // Grid display
  detail: { width: 1200, quality: 80 }, // Lightbox/detail
  hero: { width: 1920, quality: 85 },   // Hero sections
};
```

### Responsive Breakpoints
```tsx
const RESPONSIVE_WIDTHS = [400, 600, 900, 1200, 1600];
```

## 📚 Component Usage Examples

### Basic Grid Image
```tsx
<OptimizedImage
  src={dish.image_url}
  thumbSrc={dish.image_thumb} // Optional smaller version
  alt={dish.name}
  aspectRatio="square"
  quality={75}
  width={600}
  priority={index < 6} // First 6 images
/>
```

### Hero Section Image
```tsx
<OptimizedImage
  src={heroImage}
  alt="Hero"
  aspectRatio="16/9"
  quality={85}
  width={1920}
  priority={true}
  blur={true}
/>
```

### With Click Handler (Gallery)
```tsx
<OptimizedImage
  src={project.imageAfter}
  thumbSrc={project.imageThumb}
  alt={project.businessName}
  onClick={() => openLightbox(project)}
  className="cursor-pointer hover:scale-105 transition-transform"
/>
```

## 🔧 Technical Implementation

### 1. OptimizedImage Component
- Automatic blur-up placeholders
- Responsive srcSet generation
- Error state handling
- Loading state management
- Supabase Storage optimization

### 2. ImageGridSkeleton Component
- Consistent skeleton shapes
- Matches final image aspect ratios
- Smooth loading transitions

### 3. Utility Functions
```tsx
// Generate responsive srcSet
const srcSet = buildSupabaseSrcSet(imageUrl, [400, 800, 1200], 75);

// Optimize individual URLs
const optimized = toSupabaseRenderUrl(imageUrl, { 
  width: 800, 
  quality: 78, 
  format: 'webp' 
});

// Check if URL can be optimized
const canOptimize = isSupabasePublicUrl(imageUrl);
```

## 🎨 CSS Optimizations

### Critical Skeleton CSS (in index.html)
```css
.skeleton-pulse { 
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; 
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
```

### Aspect Ratio Classes
```css
.aspect-square { aspect-ratio: 1 / 1; }
.aspect-[4/3] { aspect-ratio: 4 / 3; }
.aspect-video { aspect-ratio: 16 / 9; }
```

## 🌐 CDN & Preconnect

### HTML Head Optimizations
```html
<!-- Preconnect to image CDN -->
<link rel="preconnect" href="https://uvztokbjkaosjxnziizt.supabase.co" crossorigin>
<link rel="dns-prefetch" href="https://uvztokbjkaosjxnziizt.supabase.co">

<!-- Format support hints -->
<meta name="format-detection" content="telephone=no">
<meta name="mobile-web-app-capable" content="yes">
```

## 📊 Performance Monitoring

### Key Metrics to Track
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Time to First Image**: < 1s
- **Image Load Success Rate**: > 99%

### Monitoring Code Example
```tsx
const loadTime = await measureImageLoadTime(imageUrl);
console.log(`Image loaded in ${loadTime}ms`);
```

## 🚨 Common Pitfalls to Avoid

1. **❌ No aspect-ratio containers** → Layout shifts
2. **❌ All images load eagerly** → Slow initial load
3. **❌ No error states** → Broken image icons
4. **❌ Large images in grid** → Wasted bandwidth
5. **❌ No skeleton loading** → "Flash of empty content"

## ✅ Best Practices Checklist

- [ ] Use `OptimizedImage` for all images
- [ ] Set appropriate `aspectRatio` props
- [ ] Implement skeleton loading states
- [ ] Use `thumbSrc` for grid displays
- [ ] Set loading priorities correctly
- [ ] Add error state handling
- [ ] Monitor Core Web Vitals
- [ ] Test on slow connections
- [ ] Validate responsive behavior
- [ ] Check WebP/AVIF support

## 🔄 Migration Guide

### Before (Old Code)
```tsx
<img 
  src={fullImageUrl} 
  alt="Image" 
  loading="lazy" 
  className="w-full h-full object-cover"
/>
```

### After (Optimized)
```tsx
<OptimizedImage
  src={fullImageUrl}
  thumbSrc={thumbnailUrl} // Add thumbnail version
  alt="Image"
  aspectRatio="square" // Prevent layout shift
  quality={75}
  width={600}
  priority={index < 6} // Set priority strategically
  blur={true} // Enable blur-up
/>
```

## 📈 Expected Performance Gains

- **50-80% faster perceived loading** (blur-up + skeletons)
- **60% bandwidth savings** (WebP + responsive images)
- **Zero layout shifts** (fixed aspect ratios)
- **90%+ image load success rate** (error handling)
- **Perfect Lighthouse scores** for image optimization

## 🔗 Related Files

- `src/components/ui/optimized-image.tsx` - Main component
- `src/components/ui/image-grid-skeleton.tsx` - Loading states
- `src/utils/imageOptimization.ts` - Utilities and constants  
- `src/utils/imageUrls.ts` - Supabase optimization
- `index.html` - Critical CSS and preconnects

## 💡 Future Enhancements

1. **Image caching strategies** (Service Worker)
2. **Progressive JPEG support** 
3. **AI-powered focal point detection**
4. **Automatic alt text generation**
5. **Performance analytics dashboard**

---

*This guide ensures Food Vision delivers the fastest possible image loading experience while maintaining visual quality and accessibility.*