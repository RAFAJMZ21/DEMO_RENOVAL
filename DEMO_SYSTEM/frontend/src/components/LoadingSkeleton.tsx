import React from 'react';

const bloque = 'bg-[#181d29] border border-[#252c3d] rounded-xl animate-pulse';

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${bloque} ${className}`} />
);

export const StatCardsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`${bloque} p-6 space-y-3`}>
        <SkeletonBlock className="h-3 w-2/3 !border-0 !bg-[#252c3d]" />
        <SkeletonBlock className="h-9 w-1/2 !border-0 !bg-[#252c3d]" />
        <SkeletonBlock className="h-3 w-1/3 !border-0 !bg-[#252c3d]" />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => (
  <div className="space-y-3">
    <div className="flex gap-3 px-3">
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonBlock key={index} className="h-4 flex-1 !border-0 !bg-[#252c3d]" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className={`${bloque} flex gap-3 p-4`}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonBlock key={colIndex} className="h-4 flex-1 !border-0 !bg-[#252c3d]" />
        ))}
      </div>
    ))}
  </div>
);

export const GanttSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-4 space-y-2">
          <SkeletonBlock className="h-3 w-24 !border-0 !bg-[#252c3d]" />
          <SkeletonBlock className="h-4 w-full" />
        </div>
        <div className="col-span-8">
          <SkeletonBlock className="h-9 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export const LoaderInline: React.FC<{ label?: string }> = ({ label = 'Cargando datos...' }) => (
  <div className="flex justify-center items-center py-12 text-emerald-400 gap-2">
    <span className="w-5 h-5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
    <span className="text-sm">{label}</span>
  </div>
);
