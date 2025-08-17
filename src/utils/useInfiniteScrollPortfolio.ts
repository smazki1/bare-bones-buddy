import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollPortfolioProps {
  hasNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => void;
  rootMargin?: string;
}

export const useInfiniteScrollPortfolio = ({
  hasNextPage,
  isFetching,
  fetchNextPage,
  rootMargin = '100px'
}: UseInfiniteScrollPortfolioProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: 0.1
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [handleIntersection, rootMargin]);

  return { sentinelRef };
};