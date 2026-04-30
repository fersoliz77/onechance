import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function Textarea({ className = '', ...props }: Props) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full bg-[var(--oc-surface-2)] border border-[var(--oc-border-strong)] rounded-[var(--oc-radius-sm)] px-3 py-[9px] text-white text-[12px] outline-none resize-none placeholder:text-[var(--oc-text-faint)] focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)] focus-visible:border-[rgba(0,200,83,0.38)]',
        className,
      )}
    />
  )
}
