import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface Option { value: string; label: string }

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
}

export default function Select({ options, className = '', ...props }: Props) {
  return (
    <select
      {...props}
      className={cn(
        'w-full h-[var(--oc-control-h-md)] bg-[#0C1525] border border-[var(--oc-border-strong)] rounded-[var(--oc-radius-sm)] px-3 text-[13px] lg:text-[14px] outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)] focus-visible:border-[rgba(0,200,83,0.38)]',
        props.value ? 'text-white' : 'text-[rgba(255,255,255,0.3)]',
        className,
      )}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
