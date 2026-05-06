/** Skeleton shimmer atom — reutilizable en todo el admin */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-[#1a1a1a] relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.04)] to-transparent animate-[oc-skeleton_1.5s_linear_infinite]" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[rgba(255,255,255,0.05)]">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-5 space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-3">
        {[1,2,3].map(i => <SkeletonRow key={i} />)}
      </div>
    </div>
  )
}
