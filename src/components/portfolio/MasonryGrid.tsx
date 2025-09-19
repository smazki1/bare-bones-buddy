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

  // Test with inline styles to debug CSS loading
  const getInlineStyles = (size: string) => {
    switch(size) {
      case 'small':
        return {
          width: '200px',
          height: '200px',
          backgroundColor: 'red',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        };
      case 'medium':
        return {
          width: '400px',
          height: '200px',
          backgroundColor: 'blue',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        };
      case 'large':
        return {
          width: '400px',
          height: '400px',
          backgroundColor: 'green',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        };
      default:
        return {};
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="test-grid">
        {testCards.map((card) => (
          <div 
            key={card.id}
            style={getInlineStyles(card.size)}
          >
            {card.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGrid;