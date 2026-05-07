'use client'

type RangeValue = 3 | 6 | 12

type Props = {
  roleDistribution: { player: number; coach: number; club: number; agent: number }
  totalUsers: number
  months: string[]
  roleSeries: { player: number[]; coach: number[]; club: number[]; agent: number[] }
  pendingSeries: number[]
  monthRange: RangeValue
  onMonthRangeChange: (next: RangeValue) => void
}

const ROLE_COLORS = {
  player: '#AAFF00',
  coach: '#22D3EE',
  club: '#3B82F6',
  agent: '#A855F7',
  pending: '#F59E0B',
} as const

const W = 560
const H = 170
const RANGE_OPTIONS: RangeValue[] = [3, 6, 12]

const px = (i: number, points: number) => 20 + i * ((W - 40) / Math.max(points - 1, 1))
const py = (v: number, max: number) => H - 14 - (v / Math.max(max, 1)) * (H - 28)

function seriesPath(data: number[], max: number) {
  return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i, data.length)},${py(v, max)}`).join(' ')
}

export default function AdminCharts({
  roleDistribution,
  totalUsers,
  months,
  roleSeries,
  pendingSeries,
  monthRange,
  onMonthRangeChange,
}: Props) {
  const rows = [
    { key: 'player', label: 'Jugadores', value: roleDistribution.player },
    { key: 'coach', label: 'Técnicos', value: roleDistribution.coach },
    { key: 'club', label: 'Clubes', value: roleDistribution.club },
    { key: 'agent', label: 'Representantes', value: roleDistribution.agent },
  ] as const

  const max = Math.max(...roleSeries.player, ...roleSeries.coach, ...roleSeries.club, ...roleSeries.agent, ...pendingSeries, 1)
  const lines = [
    { key: 'player', data: roleSeries.player, color: ROLE_COLORS.player },
    { key: 'coach', data: roleSeries.coach, color: ROLE_COLORS.coach },
    { key: 'club', data: roleSeries.club, color: ROLE_COLORS.club },
    { key: 'agent', data: roleSeries.agent, color: ROLE_COLORS.agent },
    { key: 'pending', data: pendingSeries, color: ROLE_COLORS.pending },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-6">
      <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[18px] font-semibold text-white">Crecimiento mensual</h3>
          <div className="inline-flex rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-1">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => onMonthRangeChange(opt)}
                className="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  background: monthRange === opt ? 'rgba(170,255,0,0.14)' : 'transparent',
                  color: monthRange === opt ? '#AAFF00' : 'rgba(255,255,255,0.5)',
                }}
              >
                {opt} meses
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-[230px] rounded-lg border border-[rgba(255,255,255,0.07)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-4">
          <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-[rgba(255,255,255,0.6)]">
            {[...rows, { key: 'pending', label: 'Solicitudes' }].map(r => (
              <span key={r.key} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLE_COLORS[r.key as keyof typeof ROLE_COLORS] }} />
                {r.label}
              </span>
            ))}
          </div>
          <svg className="h-[150px] w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {[0.25, 0.5, 0.75, 1].map(step => (
              <line key={step} x1={20} x2={W - 20} y1={py(step * max, max)} y2={py(step * max, max)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            ))}
            {lines.map(line => (
              <path key={line.key} d={seriesPath(line.data, max)} stroke={line.color} strokeWidth={line.key === 'player' ? 2.4 : 2} fill="none" />
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-[rgba(255,255,255,0.35)]">
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6">
        <h3 className="text-[18px] font-semibold text-white">Perfiles por rol</h3>
        <div className="mt-4 space-y-3">
          {rows.map(r => {
            const pct = totalUsers > 0 ? Math.round((r.value / totalUsers) * 100) : 0
            return (
              <div key={r.key}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-[rgba(255,255,255,0.75)]">{r.label}</span>
                  <span className="text-[rgba(255,255,255,0.45)]">{r.value} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ROLE_COLORS[r.key] }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
