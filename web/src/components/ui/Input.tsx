import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  wrapperClass?: string
}

export default function Input({ icon, wrapperClass = '', className = '', ...props }: Props) {
  return (
    <div className={cn('relative', wrapperClass)}>
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--oc-text-faint)] text-[13px] pointer-events-none select-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={cn(
          'w-full h-[var(--oc-control-h-md)] bg-[var(--oc-surface-2)] border border-[var(--oc-border-strong)] rounded-[var(--oc-radius-sm)] pr-3 text-white text-[13px] lg:text-[14px] outline-none placeholder:text-[var(--oc-text-faint)] focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)] focus-visible:border-[rgba(0,200,83,0.38)]',
          icon ? 'pl-8' : 'pl-3',
          className,
        )}
      />
    </div>
  )
}
