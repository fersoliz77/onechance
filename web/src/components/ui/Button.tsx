'use client'
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'green_outline'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const sizes: Record<Size, string> = {
  sm: 'text-[11px] px-[14px] py-[6px] rounded-[7px]',
  md: 'text-[12px] px-[18px] py-[9px] rounded-[8px]',
  lg: 'text-[14px] px-[28px] py-[13px] rounded-[10px]',
}

export default function Button({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }: Props) {
  const [hov, setHov] = useState(false)

  const base = 'inline-flex items-center gap-2 font-medium tracking-[-0.01em] transition-all duration-[180ms] cursor-pointer border-none font-sans disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<Variant, string> = {
    primary:     hov && !disabled ? 'bg-oc-green-hover text-oc-green-dark shadow-[0_8px_24px_rgba(0,200,83,0.35)] -translate-y-px' : 'bg-oc-green text-oc-green-dark',
    outline:     hov ? 'bg-transparent border border-[rgba(255,255,255,0.25)] text-white' : 'bg-transparent border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.55)]',
    ghost:       hov ? 'bg-transparent text-white' : 'bg-transparent text-[rgba(255,255,255,0.45)]',
    danger:      hov ? 'bg-[rgba(255,60,60,0.2)] border border-[rgba(255,60,60,0.3)] text-[#FF6060]' : 'bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.3)] text-[#FF6060]',
    green_outline: hov ? 'bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.35)] text-oc-green' : 'bg-transparent border border-[rgba(0,200,83,0.35)] text-oc-green',
  }

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
