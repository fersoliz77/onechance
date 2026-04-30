import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'green' | 'blue' | 'yellow' | 'purple'

type Props = {
  children: ReactNode
  onClick: () => void
  tone: Tone
  className?: string
}

const toneClasses: Record<Tone, string> = {
  green: 'hover:bg-[rgba(12,31,18,0.9)] hover:border-[rgba(0,200,83,0.3)]',
  blue: 'hover:bg-[rgba(10,18,40,0.9)] hover:border-[rgba(90,143,255,0.3)]',
  yellow: 'hover:bg-[rgba(20,16,5,0.9)] hover:border-[rgba(255,180,0,0.3)]',
  purple: 'hover:bg-[rgba(15,8,25,0.9)] hover:border-[rgba(180,100,255,0.3)]',
}

export default function EntityCardShell({ children, onClick, tone, className = '' }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group oc-list-card bg-[rgba(8,15,20,0.8)] border border-[var(--oc-border-soft)] transition-colors',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}
