import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetching: boolean;
}

export const useInfiniteScroll = ({ hasNextPage, fetchNextPage, isFetching }: UseInfiniteScrollProps) => {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
      return;
    }
    
    if (hasNextPage && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetching, isFetchingNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) {
      setIsFetchingNextPage(false);
    }
  }, [isFetching]);

  return { isFetchingNextPage };
};