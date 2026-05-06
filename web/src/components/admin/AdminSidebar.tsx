'use client'
import { useState, useEffect } from 'react'
import type { AdminTab } from '@/app/admin/page'

type MenuItem = { id: AdminTab; icon: string; label: string }

const MENU: MenuItem[] = [
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

const LIVE_ITEMS = ['Nuevo jugador registrado', 'Video subido · Tomás L.', 'Perfil aprobado', 'Nuevo club']
const LIVE_COLORS = ['rgba(255,255,255,0.25)', '#AAFF00', '#22D3EE', '#7B3FF6']

function OcIcon({ type }: { type: string }) {
  const map: Record<string, JSX.Element> = {
    dashboard:  <><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></>,
    user:       <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users:      <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 11a4 4 0 0 0-1-7.8"/><path d="M22 21a6 6 0 0 0-5-5.8"/></>,
    file:       <><path d="M8 3h8l4 4v14H4V3h4z"/><path d="M16 3v5h4"/><path d="M8 13h8"/><path d="M8 17h5"/></>,
    video:      <><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></>,
    chart:      <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 14 3-3 3 2 4-6"/></>,
    settings:   <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/></>,
    card:       <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></>,
    shield:     <><path d="M12 3 19 6v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"/><path d="m9 12 2 2 4-5"/></>,
    collapse:   <><path d="M15 18l-6-6 6-6"/></>,
    expand:     <><path d="M9 18l6-6-6-6"/></>,
  }
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {map[type] ?? map.dashboard}
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
  const [collapsed, setCollapsed] = useState(false)

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('oc-admin-sidebar')
    if (saved === 'collapsed') setCollapsed(true)
  }, [])
  const toggleCollapse = () => {
    setCollapsed(c => {
      localStorage.setItem('oc-admin-sidebar', !c ? 'collapsed' : 'expanded')
      return !c
    })
  }

  const w = collapsed ? 64 : 240

  return (
    <>
      {/* Spacer so main content shifts */}
      <div style={{ width: w, flexShrink: 0, transition: 'width 0.3s ease' }} />

      <aside
        className="fixed left-0 top-0 z-20 h-screen flex flex-col border-r border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,10,0.93)] backdrop-blur-xl overflow-hidden"
        style={{ width: w, transition: 'width 0.3s ease' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-6 pb-5 shrink-0" style={{ minHeight: 80 }}>
          {!collapsed && (
            <div className="text-[20px] font-black leading-[0.85] tracking-[0.07em] text-white whitespace-nowrap overflow-hidden">
              ONE<br/><span className="text-[#AAFF00]">CHANCE</span>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF00] animate-pulse" />
                <span className="text-[9px] text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Admin</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-[rgba(170,255,0,0.12)] border border-[rgba(170,255,0,0.25)] flex items-center justify-center mx-auto">
              <span className="text-[#AAFF00] text-[10px] font-black">OC</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3">
          {MENU.map(item => {
            const active = tab === item.id
            const count = item.id === 'solicitudes' ? pendingCount : undefined
            return (
              <div key={item.id} title={collapsed ? item.label : undefined}>
                <button
                  onClick={() => onTab(item.id)}
                  className="w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all cursor-pointer border-none"
                  style={{
                    height: 44,
                    padding: collapsed ? '0 13px' : '0 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: active ? 'rgba(170,255,0,0.10)' : 'transparent',
                    color: active ? '#AAFF00' : 'rgba(255,255,255,0.45)',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(170,255,0,0.22)' : 'none',
                  }}>
                  <OcIcon type={item.icon} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && count !== undefined && count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#AAFF00] text-black min-w-[20px] text-center">
                      {count}
                    </span>
                  )}
                  {collapsed && count !== undefined && count > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#AAFF00]" />
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Live widget — only when expanded */}
        {!collapsed && (
          <div className="mx-2 mb-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4 shrink-0">
            <p className="text-[11px] font-semibold text-white mb-3">Actividad en vivo</p>
            <div className="space-y-3">
              {LIVE_ITEMS.map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center"
                    style={{ borderColor: LIVE_COLORS[i] + '60' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: LIVE_COLORS[i] }} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-[rgba(255,255,255,0.75)] leading-tight">{text}</p>
                    <p className="text-[9px] text-[rgba(255,255,255,0.25)] mt-0.5">Hace {(i+1)*3} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="shrink-0 flex items-center gap-2 border-t border-[rgba(255,255,255,0.07)] px-4 py-3.5 text-[rgba(255,255,255,0.3)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all cursor-pointer bg-transparent border-x-0 border-b-0 w-full"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}>
          <OcIcon type={collapsed ? 'expand' : 'collapse'} />
          {!collapsed && <span className="text-[12px]">Colapsar</span>}
        </button>
      </aside>
    </>
  )
}
