'use client'
import { useEffect, useState } from 'react'
import { getRecentAuditLogs, ACTION_LABEL, type RecentActivity } from '@/lib/auditLog'

interface Props {
  onViewAll?: () => void
}

function timeAgo(isoString: string | null): string {
  if (!isoString) return 'Recién'
  const ms = Date.now() - new Date(isoString).getTime()
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return 'Hace un momento'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days !== 1 ? 's' : ''}`
}

const ACTION_COLOR: Record<string, string> = {
  approve_profile: '#AAFF00',
  reject_profile:  '#F43F5E',
  hide_profile:    'rgba(255,255,255,0.35)',
  publish_profile: '#22D3EE',
  delete_video:    '#F43F5E',
  toggle_video:    '#7B3FF6',
  set_featured:    '#AAFF00',
  set_role:        '#F59E0B',
  export_csv:      '#3B82F6',
}

const STATIC_FALLBACK = [
  { id:'1', initials:'MR', name:'Mateo Rodríguez',       action:'Nuevo jugador registrado',       time:'Hace 10 min', color:'#AAFF00' },
  { id:'2', initials:'CS', name:'Club Atlético del Sur',  action:'Perfil actualizado',             time:'Hace 25 min', color:'#3B82F6' },
  { id:'3', initials:'LM', name:'Lucía Martínez',         action:'Video subido',                   time:'Hace 35 min', color:'#7B3FF6' },
  { id:'4', initials:'DM', name:'Diego Martínez',         action:'Perfil aprobado',                time:'Hace 1 hora', color:'#22D3EE' },
  { id:'5', initials:'TL', name:'Tomás López',            action:'Perfil pendiente de revisión',   time:'Hace 2 horas',color:'#AAFF00' },
  { id:'6', initials:'AP', name:'Agencia Pro Sports',     action:'Nueva representante registrada', time:'Hace 3 horas',color:'#F59E0B' },
]

export default function AdminActivity({ onViewAll }: Props) {
  const [logs, setLogs] = useState<RecentActivity[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getRecentAuditLogs(6).then(data => {
      setLogs(data)
      setLoaded(true)
    }).catch((err) => {
      console.error('[AdminActivity] getRecentAuditLogs failed:', err)
      setLoaded(true)
    })
  }, [])

  const display = loaded && logs.length > 0
    ? logs.map(l => ({
        id: l.id,
        initials: (l.adminEmail || 'AD').slice(0, 2).toUpperCase(),
        name: l.adminEmail || 'Admin',
        action: ACTION_LABEL[l.action] ?? String(l.action),
        time: timeAgo(l.timestamp),
        color: ACTION_COLOR[l.action] ?? '#AAFF00',
      }))
    : STATIC_FALLBACK

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-semibold text-white">Actividad reciente</h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-[13px] font-bold text-[#AAFF00] cursor-pointer hover:underline bg-transparent border-none">Ver todas</button>
        )}
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {display.map((it) => (
          <div key={it.id} className="flex items-center gap-3 pb-3 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black text-black"
              style={{ background: `linear-gradient(135deg, ${it.color}, ${it.color}88)` }}>
              {it.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">{it.name}</p>
              <p className="text-[12px] text-[rgba(255,255,255,0.35)] truncate">{it.action}</p>
            </div>
            <span className="text-[12px] text-[rgba(255,255,255,0.25)] shrink-0">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
