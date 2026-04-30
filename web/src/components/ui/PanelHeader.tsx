import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  badgeText: string
  title: string
  subtitle: string
  badgeColorClass: string
  dotColorClass: string
  textColorClass: string
  actions?: ReactNode
}

export default function PanelHeader({ badgeText, title, subtitle, badgeColorClass, dotColorClass, textColorClass, actions }: Props) {
  return (
    <div className="mb-6 sm:mb-7 lg:mb-8">
      <div className={cn('inline-flex items-center gap-1.5 border rounded-[20px] px-2.5 sm:px-3 py-1 mb-2.5 sm:mb-3', badgeColorClass)}>
        <div className={cn('w-[5px] h-[5px] rounded-full animate-blink', dotColorClass)} />
        <span className={cn('text-[8px] sm:text-[9px] tracking-[0.07em]', textColorClass)}>{badgeText}</span>
      </div>
      <h1 className="text-white text-[38px] sm:text-[32px] lg:text-[40px] leading-[1] font-medium tracking-[-0.03em] mb-2.5">{title}</h1>
      <p className="text-[var(--oc-text-muted)] text-[15px] sm:text-[13px] lg:text-[16px] leading-[1.5] sm:leading-[1.65]">{subtitle}</p>
      {actions}
    </div>
  )
}
