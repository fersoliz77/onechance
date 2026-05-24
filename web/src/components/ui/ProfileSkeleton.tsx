function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[8px] bg-[rgba(255,255,255,0.07)] ${className}`} />
}

export default function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
        <div className="px-6 pb-8 pt-6 md:px-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bone className="h-4 w-14" />
              <Bone className="h-4 w-4" />
              <Bone className="h-4 w-24" />
            </div>
            <div className="flex gap-2">
              <Bone className="h-8 w-20" />
              <Bone className="h-8 w-20" />
            </div>
          </div>
          <div className="grid min-h-[300px] grid-cols-1 gap-8 pt-4 lg:grid-cols-[360px_1fr]">
            <Bone className="hidden h-[300px] lg:block rounded-[var(--oc-radius-lg)]" />
            <div className="flex flex-col justify-center gap-4">
              <Bone className="h-12 w-3/4" />
              <div className="flex gap-6">
                <Bone className="h-5 w-24" />
                <Bone className="h-5 w-16" />
                <Bone className="h-5 w-20" />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Bone className="h-12 w-12 rounded-[10px]" />
                <div className="flex flex-col gap-2">
                  <Bone className="h-6 w-40" />
                  <Bone className="h-4 w-28" />
                </div>
              </div>
              <div className="mt-2 flex gap-3">
                <Bone className="h-11 w-36" />
                <Bone className="h-11 w-28" />
              </div>
            </div>
          </div>
          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[var(--oc-radius-lg)] border border-[var(--oc-border)] lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-r border-[var(--oc-border)] px-4 py-3 last:border-r-0">
                <Bone className="mb-1.5 h-3 w-14" />
                <Bone className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="grid h-12 grid-cols-3 border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center border-b-2 border-transparent">
            <Bone className="h-4 w-16" />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[260px_300px_300px_1fr]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] p-5">
            <Bone className="mb-4 h-5 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Bone key={j} className="h-7 w-20 rounded-[20px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
