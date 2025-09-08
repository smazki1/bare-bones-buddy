import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/data/portfolioMock';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  console.log('🎨 ProjectCard render:', {
    businessName: project.businessName,
    hasImageAfter: !!project.imageAfter,
    imageAfterPreview: project.imageAfter?.substring(0, 50)
  });
  
  const [showBefore, setShowBefore] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getSizeClasses = (size: Project['size']) => {
    switch (size) {
      case 'small':
        return 'h-64';
      case 'medium':
        return 'h-96';
      case 'large':
        return 'h-[34rem]';
      default:
        return 'h-80';
    }
  };

  const handleToggle = () => {
    if (project.imageBefore) {
      setShowBefore(!showBefore);
    }
  };

  return (
    <motion.figure
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="break-inside-avoid mb-5 group cursor-pointer"
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
        relative overflow-hidden rounded-xl shadow-elegant hover:shadow-warm 
        transition-all duration-500 group-hover:scale-[1.02] ${getSizeClasses(project.size)}
      `}>
        {/* Main Image */}
        <div className="relative w-full h-full">
          <img
            src={showBefore && project.imageBefore ? project.imageBefore : project.imageAfter}
            alt={`${project.businessName} - ${showBefore && project.imageBefore ? 'לפני' : 'אחרי'}`}
            className={`
              w-full h-full object-cover transition-all duration-500
              ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
              group-hover:scale-110
            `}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Before/After badge */}
          {project.imageBefore && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 bg-background/90 text-foreground border"
            >
              {showBefore ? 'לפני' : 'אחרי'}
            </Badge>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          {/* Removed desktop hover overlay to keep only title and before/after label */}
        </div>

        {/* Project title only */}
        <figcaption className="absolute bottom-4 left-4 right-4 text-white">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-lg font-assistant font-semibold mb-1 text-shadow-sm">
              {project.businessName}
            </h3>
          </motion.div>
        </figcaption>
      </div>
    </motion.figure>
  );
};

export default ProjectCard;