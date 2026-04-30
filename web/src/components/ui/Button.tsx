'use client'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'green_outline'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const sizes: Record<Size, string> = {
  sm: 'text-[12px] lg:text-[13px] h-[var(--oc-control-h-sm)] px-3.5 lg:px-4 rounded-[var(--oc-radius-sm)]',
  md: 'text-[13px] lg:text-[14px] h-[var(--oc-control-h-md)] px-[18px] lg:px-5 rounded-[var(--oc-radius-sm)]',
  lg: 'text-[15px] lg:text-[16px] h-[var(--oc-control-h-lg)] px-7 lg:px-8 rounded-[var(--oc-radius-md)]',
}

export default function Button({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }: Props) {
  const base = 'inline-flex items-center gap-2 font-medium tracking-[-0.01em] transition-all duration-[180ms] cursor-pointer border-none font-sans disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)]'

  const variants: Record<Variant, string> = {
    primary: 'bg-oc-green text-oc-green-dark hover:bg-oc-green-hover hover:shadow-[0_8px_24px_rgba(0,200,83,0.35)] hover:-translate-y-px disabled:hover:shadow-none disabled:hover:translate-y-0',
    outline: 'bg-transparent border border-[var(--oc-border-strong)] text-[rgba(255,255,255,0.55)] hover:border-[rgba(255,255,255,0.25)] hover:text-white',
    ghost: 'bg-transparent text-[rgba(255,255,255,0.45)] hover:text-white',
    danger: 'bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.3)] text-[#FF6060] hover:bg-[rgba(255,60,60,0.2)]',
    green_outline: 'bg-transparent border border-[rgba(0,200,83,0.35)] text-oc-green hover:bg-[rgba(0,200,83,0.1)]',
  }

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </button>
  )
}
