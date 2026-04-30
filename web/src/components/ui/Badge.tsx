import type { ProfileStatus } from '@/types'
import { STATUS_META } from '@/types'

export default function Badge({ status }: { status: ProfileStatus }) {
  const s = STATUS_META[status]
  return (
    <span
      className="inline-block text-[9px] font-medium px-[10px] py-[3px] rounded-[10px] tracking-[0.06em] uppercase"
      style={{ background: s.bg, border: `0.5px solid ${s.border}`, color: s.color }}
    >
      {s.label}
    </span>
  )
}
