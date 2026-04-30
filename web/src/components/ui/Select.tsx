import type { SelectHTMLAttributes } from 'react'

interface Option { value: string; label: string }

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
}

export default function Select({ options, className = '', ...props }: Props) {
  return (
    <select
      {...props}
      className={`w-full bg-[#0C1525] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[9px] text-[12px] outline-none cursor-pointer ${props.value ? 'text-white' : 'text-[rgba(255,255,255,0.3)]'} ${className}`}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
