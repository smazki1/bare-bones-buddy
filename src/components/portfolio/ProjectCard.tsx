import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // <--- תיקון שגיאת ה-import

// --- הגדרת מאפיינים (Props) ---
// הוספנו את 'objectFit' כדי לשלוט ישירות על חיתוך התמונה
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2' | string;
  objectFit?: 'cover' | 'contain'; // זה המאפיין החדש שפותר את בעיית החיתוך
  priority?: boolean; 
  showSkeleton?: boolean;
  onClick?: () => void;
}

// --- Placeholder מטושטש ---
// Placeholder קטן ויעיל למניעת קפיצות בעמוד ולחווית טעינה חלקה
const generateBlurDataUrl = (width = 10, height = 10): string => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e5e7eb"/></svg>`
  )}`;
};


// --- הרכיב ---
// זו הגרסה הסופית, הפשוטה והחזקה.
// היא כבר לא מבצעת שינויים בתמונה בזמן אמת, אלא מתמקדת בהצגה מושלמת שלה.
const OptimizedImage = ({
  src,
  alt,
  className,
  aspectRatio = 'square',
  objectFit = 'cover', // ברירת המחדל היא 'cover' (חותך), אבל עכשיו אפשר לשנות את זה!
  priority = false,
  showSkeleton = true,
  onClick,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  // מתחילים עם placeholder מטושטש למעבר חלק
  const [imageSrc, setImageSrc] = useState<string>(generateBlurDataUrl());

  const aspectClasses = {
    'square': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };
  const aspectClass = aspectClasses[aspectRatio as keyof typeof aspectClasses] || aspectRatio;

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageSrc(src); // ברגע שהתמונה נטענת, מחליפים למקור האמיתי
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true); // מפסיקים להציג את ה-skeleton גם אם יש שגיאה
    };

    // מתחילים לטעון את התמונה
    img.src = src;

  }, [src]); // האפקט הזה רץ רק כשה-`src` משתנה

  if (hasError) {
    return (
      <div className={cn(
        "relative overflow-hidden bg-muted flex items-center justify-center rounded-lg",
        aspectClass,
        className
      )}>
        <div className="text-muted-foreground text-center">
          <span role="img" aria-label="Error Icon" className="text-2xl">🖼️</span>
          <p className="text-sm mt-2">שגיאה בטעינת התמונה</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg",
        aspectClass,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* מציגים skeleton רק בזמן טעינה ורק אם האפשרות מופעלת */}
      {!isLoaded && showSkeleton && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {/* התמונה עצמה עם אפקטים */}
      <motion.img
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full",
          objectFit === 'cover' ? 'object-cover' : 'object-contain' // קובע באופן דינמי אם לחתוך או להכיל
        )}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          filter: isLoaded ? "blur(0px)" : "blur(10px)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
};

export { OptimizedImage };