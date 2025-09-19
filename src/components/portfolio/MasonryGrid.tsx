import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from './ProjectCard';
import { Project } from '@/data/portfolioStore';

interface MasonryGridProps {
  projects: Project[];
  isLoading: boolean;
  hasReachedMaxItems?: boolean;
}

const MasonryGrid = ({ projects, isLoading, hasReachedMaxItems }: MasonryGridProps) => {
  const renderSkeletons = () => {
    const skeletonSizes = ['small', 'medium', 'large', 'small', 'medium', 'small'];
    
    return Array.from({ length: 6 }, (_, index) => {
      const size = skeletonSizes[index];
      const sizeClass = size === 'small' ? 'card-small' : size === 'medium' ? 'card-medium' : 'card-large';
      
      return (
        <div 
          key={`skeleton-${index}`} 
          className={`${sizeClass} overflow-hidden`}
        >
          <div className="w-full h-full min-h-[150px] rounded-lg sm:rounded-xl bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6" style={{ overflowX: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="portfolio-grid"
      >
        {projects.map((project, index) => {
          // Apply fade effect to last 6 items when max reached
          const isLastRow = hasReachedMaxItems && index >= projects.length - 6;
          const fadeOpacity = isLastRow ? 0.4 : 1;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: fadeOpacity }}
              transition={{ 
                duration: hasReachedMaxItems ? 0.8 : 0.3,
                delay: hasReachedMaxItems && isLastRow ? (index - (projects.length - 6)) * 0.05 : 0
              }}
              style={{ opacity: fadeOpacity }}
            >
              <ProjectCard
                project={project}
                index={index}
              />
            </motion.div>
          );
        })}
        
        {/* Loading skeletons */}
        {isLoading && renderSkeletons()}
      </motion.div>

      {/* Empty state */}
      {projects.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-assistant font-bold text-foreground mb-2">
            אין פרויקטים בקטגוריה זו
          </h3>
          <p className="text-muted-foreground font-open-sans">
            נסה לבחור קטגוריה אחרת או צור איתנו קשר ליצירת תוכן חדש
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MasonryGrid;