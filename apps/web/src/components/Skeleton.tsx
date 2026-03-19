import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  borderRadius = '0.375rem',
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = `bg-gray-200 ${className}`;
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${baseClasses} ${animationClasses[animation]}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}

// Pre-built skeleton patterns for common use cases

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" width="80%" />
      <Skeleton height="1rem" width="70%" />
      <div className="grid grid-cols-3 gap-4 pt-4">
        <Skeleton height="4rem" />
        <Skeleton height="4rem" />
        <Skeleton height="4rem" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <Skeleton height="1.5rem" width="30%" />
      </div>
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton height="2.5rem" width="2.5rem" borderRadius="50%" />
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="40%" />
              <Skeleton height="0.75rem" width="60%" />
            </div>
            <Skeleton height="2rem" width="5rem" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-md space-y-3">
          <Skeleton height="0.75rem" width="50%" />
          <Skeleton height="2rem" width="80%" />
          <Skeleton height="0.75rem" width="60%" />
        </div>
      ))}
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton height="4rem" width="4rem" borderRadius="1rem" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1.25rem" width="60%" />
            <Skeleton height="1rem" width="80%" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Skeleton height="2rem" />
              <Skeleton height="2rem" />
              <Skeleton height="2rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
