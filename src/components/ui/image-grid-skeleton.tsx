import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface ImageGridSkeletonProps {
  count?: number;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2';
  className?: string;
}

const ImageGridSkeleton = ({ 
  count = 8, 
  aspectRatio = 'square',
  className 
}: ImageGridSkeletonProps) => {
  const aspectClasses = {
    'square': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };

  const aspectClass = aspectClasses[aspectRatio];
  
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="break-inside-avoid mb-4">
          <div className="relative overflow-hidden rounded-lg shadow-elegant">
            <Skeleton className={cn("w-full", aspectClass)} />
            
            {/* Title skeleton */}
            <div className="absolute bottom-3 left-3 right-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { ImageGridSkeleton };