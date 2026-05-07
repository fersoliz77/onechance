'use client'
import type { ReactNode } from 'react'

const ACTIONS = [
  { icon: 'megaphone', label: 'Crear anuncio' },
  { icon: 'mail',      label: 'Enviar mensaje' },
  { icon: 'download',  label: 'Exportar datos' },
  { icon: 'image',     label: 'Gestionar banners' },
  { icon: 'flag',      label: 'Ver reportes' },
  { icon: 'settings',  label: 'Configuración' },
]

function QIcon({ type }: { type: string }) {
  const icons: Record<string, ReactNode> = {
    megaphone: <path d="M3 11v2a2 2 0 0 0 2 2h2l3 4h2l-1-4c4-.5 7-3 9-4V5c-2 1-5 3.5-9 4H5a2 2 0 0 0-2 2z"/>,
    mail:      <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    download:  <><path d="M12 3v11"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    image:     <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 15-4-4-6 6-3-3-5 5"/></>,
    flag:      <><path d="M5 21V5"/><path d="M5 5c4-2 6 2 10 0 2-1 3-1 4 0v9c-4-2-6 2-10 0-2-1-3-1-4 0"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/></>,
  }
  return (
    <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {icons[type]}
    </svg>
  )
}

export default function AdminQuickActions() {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
      <h2 className="text-[17px] font-semibold text-white mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {ACTIONS.map(a => (
          <button
            key={a.label}
            className="flex flex-col items-center justify-center h-[86px] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[12px] text-[rgba(255,255,255,0.45)] hover:text-white hover:border-[rgba(170,255,0,0.25)] hover:bg-[rgba(170,255,0,0.05)] transition-all cursor-pointer group"
          >
            <span className="text-[rgba(255,255,255,0.35)] group-hover:text-[#AAFF00] transition-colors">
              <QIcon type={a.icon} />
            </span>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
