'use client'

interface Props {
  roleDistribution: { player: number; coach: number; club: number; agent: number }
  totalUsers: number
}

const MONTHS = ['May','Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr']
const GREEN  = [44,60,54,60,72,90,96,82,85,97,90,98]
const BLUE   = [24,30,26,34,33,36,34,38,45,47,38,32]
const PURPLE = [11,15,16,14,15,15,20,20,24,27,20,17]
const AMBER  = [7, 8, 6, 5, 7, 6, 7, 7, 8, 7, 6, 3]

const W = 580, H = 190
const px = (i: number) => 20 + i * ((W - 20) / (MONTHS.length - 1))
const py = (v: number) => H - 12 - v * 1.7
const path = (d: number[]) => d.map((v,i) => `${i===0?'M':'L'}${px(i)},${py(v)}`).join(' ')

function AreaChart() {
  const greenPath = path(GREEN)
  return (
    <div className="flex flex-col h-full px-6 pb-5 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-white">Crecimiento de perfiles</h2>
        <div className="flex gap-2">
          <button className="text-[11px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer bg-transparent">Últimos 12 meses ▾</button>
          <button className="text-[11px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer bg-transparent">Exportar ▾</button>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-6 mb-3 text-[11px] text-[rgba(255,255,255,0.45)]">
        {[['#AAFF00','Jugadores'],['#3B82F6','Técnicos'],['#7B3FF6','Clubes'],['#F59E0B','Representantes']].map(([c,l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
      {/* SVG */}
      <div className="relative flex-1 min-h-0">
        <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0.25,0.5,0.75,1].map(f => (
            <line key={f} x1={20} x2={W} y1={py(f*98)} y2={py(f*98)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          ))}
          {/* Area fill */}
          <path d={`${greenPath} L${px(GREEN.length-1)},${H} L${px(0)},${H} Z`} fill="url(#area-g)"/>
          {/* Lines */}
          <path d={greenPath}  stroke="#AAFF00" strokeWidth="2.5" fill="none"/>
          <path d={path(BLUE)}   stroke="#3B82F6" strokeWidth="2"   fill="none"/>
          <path d={path(PURPLE)} stroke="#7B3FF6" strokeWidth="2"   fill="none"/>
          <path d={path(AMBER)}  stroke="#F59E0B" strokeWidth="2"   fill="none"/>
          {/* Dots – green only */}
          {GREEN.map((v,i) => <circle key={i} cx={px(i)} cy={py(v)} r="3" fill="#AAFF00"/>)}
          <defs>
            <linearGradient id="area-g" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#AAFF00" stopOpacity=".22"/>
              <stop offset="1" stopColor="#AAFF00" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
        {/* X labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-[10px] text-[10px] text-[rgba(255,255,255,0.25)]">
          {MONTHS.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  )
}

function DonutChart({ roleDistribution, totalUsers }: Props) {
  const total = totalUsers || 1
  const items = [
    { label: 'Jugadores',      value: roleDistribution.player, color: '#AAFF00' },
    { label: 'Técnicos',       value: roleDistribution.coach,  color: '#3B82F6' },
    { label: 'Clubes',         value: roleDistribution.club,   color: '#7B3FF6' },
    { label: 'Representantes', value: roleDistribution.agent,  color: '#F59E0B' },
  ]
  // Build conic-gradient stops
  let acc = 0
  const stops = items.map(it => {
    const pct = (it.value / total) * 100
    const from = acc
    acc += pct
    return `${it.color} ${from.toFixed(1)}% ${acc.toFixed(1)}%`
  }).join(', ')

  return (
    <div className="flex flex-col h-full px-6 pt-5 pb-5">
      <h2 className="text-[16px] font-semibold text-white mb-4">Perfiles por estado</h2>
      <div className="flex items-center justify-center gap-8 flex-1">
        {/* Donut */}
        <div className="relative w-44 h-44 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops || '#AAFF00 0% 100%'})` }}>
          <div className="absolute inset-4 rounded-full bg-[#0A0A0A] flex flex-col items-center justify-center shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]">
            <span className="text-[11px] text-[rgba(255,255,255,0.35)]">Total</span>
            <span className="text-[24px] font-semibold text-white leading-tight">{totalUsers.toLocaleString()}</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-4 text-sm flex-1">
          {items.map(it => {
            const pct = total > 0 ? Math.round((it.value / total) * 100) : 0
            return (
              <div key={it.label} className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2">
                <span className="flex items-center gap-2 text-[rgba(255,255,255,0.55)] text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: it.color }} />
                  {it.label}
                </span>
                <span className="text-[rgba(255,255,255,0.35)] text-[12px]">{it.value} ({pct}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AdminCharts(props: Props) {
  return (
    <div className="grid grid-cols-[1.65fr_1fr] gap-5">
      {/* Area chart */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] h-[340px]">
        <AreaChart />
      </div>
      {/* Donut */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] h-[340px]">
        <DonutChart {...props} />
      </div>
    </div>
  )
}
