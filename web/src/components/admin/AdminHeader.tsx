'use client'
import type { UserRecord } from '@/types'

interface Props {
  user: UserRecord
  pendingCount: number
  onViewSite: () => void
}

export default function AdminHeader({ user, pendingCount, onViewSite }: Props) {
  const initials = (user.name || user.email || 'AD').slice(0, 2).toUpperCase()
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-7 py-4 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,10,0.85)] backdrop-blur-xl">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Panel de administración</h1>
        <p className="text-xs text-[rgba(255,255,255,0.35)] mt-0.5">Bienvenido, Administrador. Gestioná toda la plataforma desde aquí.</p>
      </div>
      <div className="flex items-center gap-5">
        {/* Search */}
        <button className="p-2 rounded-lg text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer bg-transparent border-none">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer bg-transparent border-none">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/></svg>
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#AAFF00] text-[9px] font-black text-black">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-[rgba(255,255,255,0.08)]" />

        {/* View site */}
        <button
          onClick={onViewSite}
          className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.45)] hover:text-white border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] rounded-lg px-3 py-2 transition-all cursor-pointer bg-transparent"
        >
          Ver sitio público
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 5h5v5"/><path d="M10 14 19 5"/><path d="M19 14v5H5V5h5"/></svg>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-tight">{user.name || 'Administrador'}</p>
            <p className="text-[11px] font-bold text-[#AAFF00]">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#AAFF00] to-[#7B3FF6] flex items-center justify-center text-[11px] font-black text-black shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
