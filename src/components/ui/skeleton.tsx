import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

const Skeleton = ({ className, width = "100%", height = "1rem", style, ...props }: SkeletonProps) => {
  return (
    <div 
      className={cn("skeleton rounded", className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};

const TutorCardSkeleton = () => {
  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-card max-w-sm mx-auto">
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/3] rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="40%" height="1.5rem" />
          <Skeleton width="20%" height="1rem" />
        </div>
        
        {/* Classes */}
        <div className="flex gap-2">
          <Skeleton width="80px" height="1.5rem" className="rounded-full" />
          <Skeleton width="90px" height="1.5rem" className="rounded-full" />
          <Skeleton width="70px" height="1.5rem" className="rounded-full" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton width="50%" height="2.5rem" className="rounded-lg" />
          <Skeleton width="50%" height="2.5rem" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

const HotTopicsSkeleton = () => {
  return (
    <div className="glass-card p-4 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton width="24px" height="24px" className="rounded" />
        <Skeleton width="150px" height="1.25rem" />
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3">
              <Skeleton width="24px" height="24px" className="rounded-full" />
              <Skeleton width="100px" height="1rem" />
            </div>
            <Skeleton width="80px" height="1rem" />
          </div>
        ))}
      </div>
    </div>
  );
};

export { Skeleton, TutorCardSkeleton, HotTopicsSkeleton };