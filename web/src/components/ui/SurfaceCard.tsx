import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
}

export default function SurfaceCard({ children, className = '' }: Props) {
  return <div className={cn('bg-[var(--oc-surface-1)] border border-[var(--oc-border-soft)] rounded-[var(--oc-radius-xl)] p-[18px] md:p-5', className)}>{children}</div>
}
