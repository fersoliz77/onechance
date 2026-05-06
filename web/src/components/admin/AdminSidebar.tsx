'use client'
import type { AdminTab } from '@/app/admin/page'

type Item = { id: AdminTab; icon: string; label: string; badge?: number }

const MENU: Item[] = [
  { id: 'dashboard',     icon: 'dashboard',    label: 'Dashboard' },
  { id: 'perfiles',      icon: 'user',         label: 'Perfiles' },
  { id: 'usuarios',      icon: 'users',        label: 'Usuarios' },
  { id: 'solicitudes',   icon: 'file',         label: 'Solicitudes' },
  { id: 'videos',        icon: 'video',        label: 'Videos' },
  { id: 'estadisticas',  icon: 'chart',        label: 'Estadísticas' },
  { id: 'suscripciones', icon: 'card',         label: 'Suscripciones' },
  { id: 'moderacion',    icon: 'shield',       label: 'Moderación' },
  { id: 'configuracion', icon: 'settings',     label: 'Configuración' },
]

const LIVE = [
  'Nuevo jugador registrado',
  'Video subido · Tomás L.',
  'Perfil aprobado',
  'Nuevo club registrado',
]
const LIVE_COLORS = ['rgba(255,255,255,0.25)', '#AAFF00', '#22D3EE', '#7B3FF6']

function OcIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users:     <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 11a4 4 0 0 0-1-7.8"/><path d="M22 21a6 6 0 0 0-5-5.8"/></>,
    file:      <><path d="M8 3h8l4 4v14H4V3h4z"/><path d="M16 3v5h4"/><path d="M8 13h8"/><path d="M8 17h5"/></>,
    video:     <><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></>,
    chart:     <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 14 3-3 3 2 4-6"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/></>,
    card:      <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></>,
    shield:    <><path d="M12 3 19 6v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"/><path d="m9 12 2 2 4-5"/></>,
  }
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {icons[type]}
    </svg>
  )
}

interface Props {
  tab: AdminTab
  onTab: (t: AdminTab) => void
  pendingCount: number
  isSuperAdmin: boolean
}

export default function AdminSidebar({ tab, onTab, pendingCount }: Props) {
  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-[240px] flex flex-col border-r border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,10,0.92)] backdrop-blur-xl">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6 shrink-0">
        <div className="text-[22px] font-black leading-[0.85] tracking-[0.08em] text-white">
          ONE<br />
          <span className="text-[#AAFF00]">CHANCE</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF00] animate-pulse" />
          <span className="text-[10px] text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Panel Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-3">
        {MENU.map(item => {
          const active = tab === item.id
          const count = item.id === 'solicitudes' ? pendingCount : undefined
          return (
            <button
              key={item.id}
              onClick={() => onTab(item.id)}
              className="w-full flex items-center gap-3 h-11 px-3.5 rounded-lg text-sm font-medium transition-all cursor-pointer border-none text-left"
              style={{
                background: active ? 'rgba(170,255,0,0.10)' : 'transparent',
                color: active ? '#AAFF00' : 'rgba(255,255,255,0.45)',
                boxShadow: active ? 'inset 0 0 0 1px rgba(170,255,0,0.22)' : 'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)' } }}
            >
              <OcIcon type={item.icon} />
              <span className="flex-1">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#AAFF00] text-black min-w-[20px] text-center">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Live activity widget */}
      <div className="shrink-0 mx-3 mb-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
        <p className="text-[12px] font-semibold text-white mb-3">Actividad en vivo</p>
        <div className="space-y-3">
          {LIVE.map((text, i) => (
            <div key={text} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full border flex items-center justify-center"
                style={{ borderColor: LIVE_COLORS[i] + '60' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: LIVE_COLORS[i] }} />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-[rgba(255,255,255,0.8)] leading-tight">{text}</p>
                <p className="text-[10px] text-[rgba(255,255,255,0.25)] mt-0.5">Hace {(i + 1) * 3} min</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-lg border border-[rgba(255,255,255,0.1)] py-2 text-[11px] text-[rgba(255,255,255,0.4)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent">
          Ver todas las actividades
        </button>
      </div>
    </aside>
  )
}
