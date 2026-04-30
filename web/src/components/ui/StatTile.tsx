type Props = {
  label: string
  value: number | string
  color: string
}

export default function StatTile({ label, value, color }: Props) {
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-[14px_16px] text-center">
      <div className="text-[22px] leading-none font-medium tracking-[-0.02em]" style={{ color }}>{value}</div>
      <div className="text-[rgba(255,255,255,0.23)] text-[9px] uppercase tracking-[0.07em] mt-1.5">{label}</div>
    </div>
  )
}
