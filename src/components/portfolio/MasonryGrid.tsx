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
  // SIMPLE TEST FIRST - DELETE THIS ONCE WORKING
  const testCards = [
    { id: 'test1', size: 'small', name: 'SMALL TEST' },
    { id: 'test2', size: 'medium', name: 'MEDIUM TEST' },
    { id: 'test3', size: 'large', name: 'LARGE TEST' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="test-grid">
        {testCards.map((card) => (
          <div 
            key={card.id}
            className={`test-${card.size}`}
          >
            {card.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGrid;