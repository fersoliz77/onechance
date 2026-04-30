import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
}

export default function InlineFiltersBar({ children, className = '' }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-0 rounded-[12px] sm:rounded-none border border-[var(--oc-border-soft)] sm:border-none bg-[var(--oc-surface-1)] sm:bg-transparent',
        'lg:mb-7 lg:gap-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
