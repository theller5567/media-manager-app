import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Loading skeleton component for displaying loading states
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-700 rounded ${className}`}
          aria-label="Loading..."
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
