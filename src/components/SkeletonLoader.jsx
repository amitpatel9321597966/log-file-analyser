import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="card-base p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 rounded-md" />
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
      </div>
      <div className="mt-5 h-8 w-36 bg-slate-200 rounded-md" />
      <div className="mt-4 h-3.5 w-24 bg-slate-100 rounded-md" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-72" }) {
  return (
    <div className={`card-base p-6 animate-pulse flex flex-col justify-between ${height}`}>
      <div className="flex items-center justify-between">
        <div className="h-5 w-44 bg-slate-200 rounded-md" />
        <div className="h-4 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="my-auto flex items-end gap-3 h-44 px-4">
        {[40, 65, 30, 85, 50, 95, 75, 45, 60, 90, 70, 80].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-100 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="h-3.5 w-full bg-slate-100 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="card-base overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-slate-100 rounded"
                style={{ width: `${Math.max(40, (c + 1) * 22)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

