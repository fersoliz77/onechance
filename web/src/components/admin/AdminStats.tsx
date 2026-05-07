'use client'

interface Props {
  totalUsers: number
  published: number
  pending: number
  videos: number
  roleDistribution: { player: number; coach: number; club: number; agent: number }
  deltas: {
    profiles: string
    player: string
    coach: string
    club: string
    agent: string
    videos: string
    pending: string
  }
}

const STATS = (p: Props) => [
  { label: 'Perfiles totales', value: (p.published + p.pending).toLocaleString(), delta: p.deltas.profiles, color: '#AAFF00', icon: 'dashboard' },
  { label: 'Jugadores',        value: p.roleDistribution.player.toLocaleString(), delta: p.deltas.player, color: '#7B3FF6', icon: 'user' },
  { label: 'Técnicos',         value: p.roleDistribution.coach.toLocaleString(),  delta: p.deltas.coach, color: '#22D3EE', icon: 'shield' },
  { label: 'Clubes',           value: p.roleDistribution.club.toLocaleString(),   delta: p.deltas.club, color: '#3B82F6', icon: 'briefcase' },
  { label: 'Representantes',   value: p.roleDistribution.agent.toLocaleString(),  delta: p.deltas.agent, color: '#a855f7', icon: 'user' },
  { label: 'Pendientes',       value: p.pending.toLocaleString(),                 delta: p.deltas.pending, color: '#F59E0B', icon: 'clock', warn: p.pending > 0 },
]

function Sparkline() {
  return (
    <svg className="absolute bottom-3 right-3 h-9 w-32 opacity-70" viewBox="0 0 130 45" fill="none">
      <path d="M0 38 C8 26 14 40 21 29 S34 16 41 27 48 40 57 18 66 7 73 24 82 31 90 15 97 23 106 18 114 13 123 2 130 10" stroke="#AAFF00" strokeWidth="2"/>
      <path d="M0 45 L0 38 C8 26 14 40 21 29 S34 16 41 27 48 40 57 18 66 7 73 24 82 31 90 15 97 23 106 18 114 13 123 2 130 10 L130 45 Z" fill="url(#spk)"/>
      <defs><linearGradient id="spk" x1="65" y1="0" x2="65" y2="45"><stop stopColor="#AAFF00" stopOpacity=".35"/><stop offset="1" stopColor="#AAFF00" stopOpacity="0"/></linearGradient></defs>
    </svg>
  )
}

export default function AdminStats(props: Props) {
  const stats = STATS(props)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((s, i) => (
        <div key={s.label} className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 hover:border-[rgba(255,255,255,0.13)] transition-colors">
          {/* Glow top-right */}
          <div className="pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20" style={{ background: s.color, filter: 'blur(20px)' }} />
          <p className="text-[13px] font-medium text-[rgba(255,255,255,0.45)]">{s.label}</p>
          <p className="mt-2 text-[29px] font-semibold text-white leading-none">{s.value}</p>
          <p className="mt-2 text-[12px] font-bold" style={{ color: s.warn ? '#F59E0B' : '#AAFF00' }}>{s.delta}</p>
          {i === 0 && <Sparkline />}
        </div>
      ))}
    </div>
  )
}
