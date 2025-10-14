import { motion } from 'framer-motion';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from './ProjectCard';
import { Project } from '@/data/portfolioStore';

interface MasonryGridProps {
  projects: Project[];
  isLoading: boolean;
  hasReachedMaxItems?: boolean;
}

const MasonryGrid = ({ projects, isLoading, hasReachedMaxItems }: MasonryGridProps) => {
  // State to track before/after toggle for each project
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  
  // Toggle handler for individual projects
  const handleToggle = (projectId: string) => {
    setToggleStates(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Portfolio card size system with responsive inline styles
  const getCardStyles = (size: Project['size']) => {
    const baseStyles = {
      position: 'relative' as const,
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(139, 30, 63, 0.1)',
      transition: 'all 0.3s ease',
    };

    // Mobile-first responsive sizing
    const isMobile = window.innerWidth < 640;
    
    if (isMobile) {
      // All cards same size on mobile for consistency and speed
      return {
        ...baseStyles,
        width: '100%',
        maxWidth: '400px',
        height: '300px',
      };
    }

    // Desktop sizing
    switch(size) {
      case 'small':
        return {
          ...baseStyles,
          width: '280px',
          height: '280px',
        };
      case 'medium':
        return {
          ...baseStyles,
          width: '280px',
          height: '420px',
        };
      case 'large':
        return {
          ...baseStyles,
          width: '580px',
          height: '420px',
        };
      default:
        return {
          ...baseStyles,
          width: '280px',
          height: '280px',
        };
    }
  };

  // Loading skeleton styles
  const getSkeletonStyles = (size: string) => {
    const cardStyles = getCardStyles(size as Project['size']);
    return {
      ...cardStyles,
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Portfolio Grid */}
      <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
        {/* Render Projects */}
        {projects.map((project, index) => {
          const showBefore = toggleStates[project.id] || false;
          const currentImage = showBefore && project.imageBefore ? project.imageBefore : project.imageAfter;
          const canToggle = project.imageBefore && project.imageBefore !== project.imageAfter;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
              style={getCardStyles(project.size)}
              className="group hover:shadow-lg active:scale-[0.98] sm:hover:scale-[1.02]"
              onClick={() => canToggle && handleToggle(project.id)}
              role={canToggle ? "button" : undefined}
              tabIndex={canToggle ? 0 : undefined}
              onKeyDown={(e) => {
                if (canToggle && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleToggle(project.id);
                }
              }}
            >
              {/* Image Container */}
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img
                  key={`${project.id}-${showBefore}`}
                  src={currentImage}
                  alt={`${project.businessName} - ${showBefore ? 'לפני' : 'אחרי'}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'opacity 0.3s ease',
                  }}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  fetchPriority={index < 3 ? 'high' : 'auto'}
                  decoding="async"
                />
                
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '100px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  pointerEvents: 'none',
                }} />

                {/* Before/After Badge - only show if toggle is available */}
                {canToggle && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: showBefore ? 'rgba(243, 117, 43, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    color: showBefore ? 'white' : '#8B1E3F',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Assistant, sans-serif',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    {showBefore ? 'לפני' : 'אחרי'}
                  </div>
                )}

                {/* Click indicator for toggle-able cards */}
                {canToggle && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'Assistant, sans-serif',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                  className="group-hover:opacity-100"
                  >
                    לחץ להחלפה
                  </div>
                )}

                {/* Business Name */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  color: 'white',
                }}>
                  <h3 style={{
                    fontSize: project.size === 'large' ? '20px' : '16px',
                    fontWeight: '700',
                    fontFamily: 'Assistant, sans-serif',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    margin: 0,
                  }}>
                    {project.businessName || 'פרויקט ללא שם'}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Loading Skeletons */}
        {isLoading && (
          <>
            {Array.from({ length: 6 }).map((_, index) => {
              const sizes = ['small', 'medium', 'large'];
              const randomSize = sizes[index % sizes.length];
              return (
                <div 
                  key={`skeleton-${index}`}
                  style={getSkeletonStyles(randomSize)}
                >
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '14px',
                    fontFamily: 'Assistant, sans-serif',
                  }}>
                    טוען...
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            אין פרויקטים להצגה
          </p>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;