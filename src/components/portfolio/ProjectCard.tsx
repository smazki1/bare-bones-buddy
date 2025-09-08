import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/data/portfolioMock';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const [showBefore, setShowBefore] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1, rootMargin: '100px' });
  const isMobile = useIsMobile();
  // Load immediately for mobile and first items, otherwise use intersection observer
  const shouldLoadImage = isMobile || index < 8 || isIntersecting;

  const getSizeClasses = (size: Project['size']) => {
    switch (size) {
      case 'small':
        return 'h-64 sm:h-64';
      case 'medium':
        return 'h-80 sm:h-96';
      case 'large':
        return 'h-96 sm:h-[34rem]';
      default:
        return 'h-72 sm:h-80';
    }
  };

  const handleToggle = () => {
    if (project.imageBefore) {
      setShowBefore(!showBefore);
    }
  };

  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="break-inside-avoid mb-4 sm:mb-5 group cursor-pointer touch-manipulation"
      onClick={handleToggle}
      aria-label={`פרויקט: ${project.businessName}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className={`
        relative overflow-hidden rounded-lg sm:rounded-xl shadow-elegant 
        transition-all duration-200 active:scale-[0.98] sm:hover:shadow-warm sm:group-hover:scale-[1.02] 
        ${getSizeClasses(project.size)}
      `}>
        {/* Main Image */}
        <div ref={ref} className="relative w-full h-full">
          {!imageError && shouldLoadImage && (
            <img
              src={showBefore && project.imageBefore ? project.imageBefore : project.imageAfter}
              alt={`${project.businessName} - ${showBefore && project.imageBefore ? 'לפני' : 'אחרי'}`}
              className={`
                w-full h-full object-cover transition-all duration-200
                ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
                sm:group-hover:scale-105
              `}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 33vw"
              fetchPriority={index < 2 ? 'high' : 'auto'}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <div className="text-muted-foreground text-center">
                <div className="text-2xl mb-2">🖼️</div>
                <p className="text-sm">שגיאה בטעינת התמונה</p>
              </div>
            </div>
          )}

          {/* Before/After badge */}
          {project.imageBefore && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/90 text-foreground border text-xs sm:text-sm"
            >
              {showBefore ? 'לפני' : 'אחרי'}
            </Badge>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          {/* Removed desktop hover overlay to keep only title and before/after label */}
        </div>

        {/* Project title only */}
        <figcaption className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <h3 className="text-base sm:text-lg font-assistant font-semibold mb-1 text-shadow-sm leading-tight">
              {project.businessName}
            </h3>
          </motion.div>
        </figcaption>
      </div>
    </motion.figure>
  );
};

export default ProjectCard;