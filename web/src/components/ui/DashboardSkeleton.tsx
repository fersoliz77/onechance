function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[8px] bg-[rgba(255,255,255,0.07)] ${className}`} />
}

export default function DashboardSkeleton() {
  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Bone className="h-[56px] w-[56px] rounded-full lg:h-[64px] lg:w-[64px]" />
        <div className="flex flex-col gap-2">
          <Bone className="h-6 w-40" />
          <Bone className="h-4 w-24" />
        </div>
        <div className="ml-auto">
          <Bone className="h-9 w-32" />
        </div>
      </div>
      {/* Status card */}
      <div className="mb-6 rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <Bone className="h-5 w-28" />
          <Bone className="h-6 w-20 rounded-[20px]" />
        </div>
        <Bone className="mb-2 h-2 w-full rounded-full" />
        <div className="mt-3 flex gap-3">
          <Bone className="h-10 w-36" />
          <Bone className="h-10 w-28" />
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-9 w-24 rounded-[8px]" />
        ))}
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] p-5">
            <Bone className="mb-4 h-5 w-32" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Bone className="h-4 w-24" />
                  <Bone className="h-4 w-36" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
