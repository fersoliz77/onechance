import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface Option { value: string; label: string }

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
}

export default function Select({ options, className = '', ...props }: Props) {
  return (
    <div className="group relative">
      <select
        {...props}
        className={cn(
          'w-full h-[var(--oc-control-h-md)] appearance-none bg-[var(--oc-surface-2)] border border-[var(--oc-border-strong)] rounded-[var(--oc-radius-sm)] px-3 pr-10 text-[14px] lg:text-[15px] outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)] focus-visible:border-[rgba(0,200,83,0.38)]',
          props.value ? 'text-white' : 'text-[rgba(255,255,255,0.3)]',
          className,
        )}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[var(--oc-surface-2)] text-white">{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.7)] transition-transform duration-200 group-focus-within:rotate-180" aria-hidden="true">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}
