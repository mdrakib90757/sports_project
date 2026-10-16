import React from 'react';

export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-xl relative overflow-hidden ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-5 rounded-lg" />
        <Skeleton className="w-16 h-4 rounded-md" />
      </div>

      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-16 h-3 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col items-center px-4">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-12 h-3 rounded-md mt-1" />
        </div>

        <div className="flex items-center justify-end gap-3 flex-1">
          <div className="space-y-1.5 flex-1 items-end flex flex-col">
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-16 h-3 rounded-md" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <Skeleton className="w-32 h-3 rounded-md" />
        <Skeleton className="w-20 h-4 rounded-md" />
      </div>
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Skeleton className="w-36 h-5 rounded-lg" />
        <Skeleton className="w-24 h-4 rounded-md" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-4 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-32 h-4 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-4 rounded" />
              <Skeleton className="w-6 h-4 rounded" />
              <Skeleton className="w-8 h-5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopScorersSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-card rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-md" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-4 rounded-md" />
              <Skeleton className="w-20 h-3 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-12 h-6 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
