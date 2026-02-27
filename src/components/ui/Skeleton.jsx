/** Animated shimmer skeleton UI primitives */

function Shimmer({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-[#2C2C2E] ${className}`}
    />
  );
}

/** Skeleton for a single HistoryCard / InvoiceCard */
export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-4 w-16" />
          </div>
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

/** Grid of skeleton cards for history pages */
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a full-width form row */
export function FormRowSkeleton() {
  return (
    <div className="card space-y-3">
      <Shimmer className="h-4 w-32 mb-1" />
      <Shimmer className="h-10 w-full" />
      <Shimmer className="h-10 w-full" />
      <Shimmer className="h-10 w-3/4" />
    </div>
  );
}
