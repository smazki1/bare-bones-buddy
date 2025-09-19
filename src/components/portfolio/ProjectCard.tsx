import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { StaticImage } from '@/components/ui/StaticImage';
import { Project } from '@/data/portfolioStore';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const [showBefore, setShowBefore] = useState(false);

  const getSizeClasses = (size: Project['size']) => {
    switch (size) {
      case 'small':
        return 'card-small';
      case 'medium':
        return 'card-medium';
      case 'large':
        return 'card-large';
      default:
        return 'card-small';
    }
  };

  const handleToggle = () => {
    if (project.imageBefore) {
      setShowBefore(!showBefore);
    }
  };

  const currentSrc = showBefore && project.imageBefore ? project.imageBefore : project.imageAfter;


  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className={`group cursor-pointer touch-manipulation ${getSizeClasses(project.size)}`}
      style={{ contentVisibility: 'auto' }}
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
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl shadow-elegant 
        transition-all duration-200 active:scale-[0.98] sm:hover:shadow-warm sm:group-hover:scale-[1.02] 
        w-full h-full min-h-[150px]"
      >
        {/* Main Image */}
        <div className="relative w-full h-full">
          <StaticImage
            src={currentSrc}
            alt={`${project.businessName} - ${showBefore && project.imageBefore ? 'לפני' : 'אחרי'}`}
            priority={index < 6} 
            className="w-full h-full object-cover object-center sm:group-hover:scale-105 transition-transform duration-200"
            blur={true}
            showSkeleton={false}
          />

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
          
        </div>

        {/* Project title only */}
        <figcaption className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <h3 className="text-base sm:text-lg font-assistant font-semibold mb-1 text-shadow-sm leading-tight">
              {project.businessName || 'פרויקט ללא שם'}
            </h3>
          </motion.div>
        </figcaption>
      </div>
    </motion.figure>
  );
};

export default ProjectCard;