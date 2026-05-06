'use client'
import type { PendingItem } from '@/app/admin/page'
import type { PlayerProfile, VideoEntry } from '@/types'

interface Props {
  pending: PendingItem[]
  players: PlayerProfile[]
  videos: (VideoEntry & { playerUid: string })[]
}

interface ActivityItem {
  initials: string
  name: string
  action: string
  time: string
  color: string
}

export default function AdminActivity({ pending, players, videos }: Props) {
  const items: ActivityItem[] = [
    ...pending.slice(0, 2).map((p, i) => ({
      initials: ((p.fullName ?? p.name ?? '??') as string).split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase(),
      name: (p.fullName ?? p.name ?? 'Sin nombre') as string,
      action: 'Perfil pendiente de revisión',
      time: `Hace ${(i + 1) * 10} min`,
      color: '#AAFF00',
    })),
    ...players.filter(p => p.status === 'published').slice(0, 2).map((p, i) => ({
      initials: p.fullName.split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase(),
      name: p.fullName,
      action: 'Perfil aprobado',
      time: `Hace ${(i + 1) * 25} min`,
      color: '#22D3EE',
    })),
    ...videos.slice(0, 2).map((v, i) => ({
      initials: 'VI',
      name: v.title ?? 'Video sin título',
      action: 'Video subido',
      time: `Hace ${(i + 1) * 35} min`,
      color: '#7B3FF6',
    })),
  ].slice(0, 6)

  // Fallback with static data if no real data yet
  const display: ActivityItem[] = items.length > 0 ? items : [
    { initials:'MR', name:'Mateo Rodríguez',       action:'Nuevo jugador registrado',       time:'Hace 10 min', color:'#AAFF00' },
    { initials:'CS', name:'Club Atlético del Sur',  action:'Perfil actualizado',             time:'Hace 25 min', color:'#3B82F6' },
    { initials:'LM', name:'Lucía Martínez',         action:'Video subido',                   time:'Hace 35 min', color:'#7B3FF6' },
    { initials:'DM', name:'Diego Martínez',         action:'Perfil aprobado',                time:'Hace 1 hora', color:'#22D3EE' },
    { initials:'TL', name:'Tomás López',            action:'Perfil pendiente de revisión',   time:'Hace 2 horas',color:'#AAFF00' },
    { initials:'AP', name:'Agencia Pro Sports',     action:'Nueva representante registrada', time:'Hace 3 horas',color:'#F59E0B' },
  ]

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-white">Actividad reciente</h2>
        <button className="text-[12px] font-bold text-[#AAFF00] cursor-pointer hover:underline bg-transparent border-none">Ver todas</button>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {display.map((it, i) => (
          <div key={i} className="flex items-center gap-3 pb-3 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
            {/* Avatar */}
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black text-black"
              style={{ background: `linear-gradient(135deg, ${it.color}, ${it.color}88)` }}>
              {it.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{it.name}</p>
              <p className="text-[11px] text-[rgba(255,255,255,0.35)] truncate">{it.action}</p>
            </div>
            <span className="text-[11px] text-[rgba(255,255,255,0.25)] shrink-0">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
