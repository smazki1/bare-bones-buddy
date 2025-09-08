import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getAvailableTags } from '@/utils/tagUtils';
import { useState, useEffect } from 'react';
import '../data/solutionsSync'; // Import to trigger solutions sync

interface FilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterPills = ({ activeFilter, onFilterChange }: FilterPillsProps) => {
  const [availableTags, setAvailableTags] = useState(() => getAvailableTags());

  // Listen for solutions updates to refresh available tags
  useEffect(() => {
    const handleSolutionsUpdate = () => {
      setAvailableTags(getAvailableTags());
    };

    window.addEventListener('solutions:updated', handleSolutionsUpdate);
    return () => window.removeEventListener('solutions:updated', handleSolutionsUpdate);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:justify-center">
          {availableTags.map((filter, index) => (
            <motion.div
              key={filter.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex-shrink-0 snap-center"
            >
              <Button
                variant={activeFilter === filter.slug ? "default" : "outline"}
                onClick={() => onFilterChange(filter.slug)}
                className={`
                  whitespace-nowrap font-assistant font-medium transition-all duration-300
                  ${activeFilter === filter.slug 
                    ? 'bg-primary text-primary-foreground shadow-elegant border-primary' 
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
                aria-pressed={activeFilter === filter.slug}
              >
                {filter.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FilterPills;