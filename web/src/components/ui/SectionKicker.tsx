import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function SectionKicker({ children, className = '' }: Props) {
  return <div className={`text-[rgba(255,255,255,0.26)] text-[11px] sm:text-[10px] uppercase tracking-[0.07em] ${className}`}>{children}</div>
}
