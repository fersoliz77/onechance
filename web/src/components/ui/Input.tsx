import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  wrapperClass?: string
}

export default function Input({ icon, wrapperClass = '', className = '', ...props }: Props) {
  return (
    <div className={`relative ${wrapperClass}`}>
      {icon && (
        <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] text-[13px] pointer-events-none select-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[8px] ${icon ? 'pl-[32px]' : 'pl-[12px]'} pr-[12px] py-[9px] text-white text-[12px] outline-none placeholder:text-[rgba(255,255,255,0.25)] ${className}`}
      />
    </div>
  )
}
