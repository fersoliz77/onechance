'use client'
import Image from 'next/image'

export type Density = 'comfortable' | 'compact'

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  user:        'Usuario',
}

interface Props {
  user: { name?: string; email?: string | null } | null
  photoURL?: string | null
  pendingCount: number
  density: Density
  role?: string
  onDensityToggle: () => void
  onViewSite: () => void
  onOpenPalette: () => void
  onViewPending?: () => void
  onMobileMenu?: () => void
}

export default function AdminHeader({ user, photoURL, pendingCount, density, role, onDensityToggle, onViewSite, onOpenPalette, onViewPending, onMobileMenu }: Props) {
  const initials = (user?.name || user?.email || 'AD').slice(0, 2).toUpperCase()
  const roleLabel = ROLE_LABEL[role ?? ''] ?? 'Admin'

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 md:px-7 py-3 md:py-4 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,10,0.88)] backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMobileMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all cursor-pointer bg-transparent border-none lg:hidden"
          aria-label="Abrir menú de navegación"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-[16px] md:text-[19px] font-semibold text-white tracking-tight truncate">Panel de administración</h1>
          <p className="hidden sm:block text-[13px] text-[rgba(255,255,255,0.35)] mt-0.5">Bienvenido. Gestioná toda la plataforma desde aquí.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* ⌘K palette button */}
        <button
          onClick={onOpenPalette}
          className="hidden md:flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.35)] border border-[rgba(255,255,255,0.09)] rounded-lg px-3 py-2 hover:text-white hover:border-[rgba(255,255,255,0.18)] transition-all cursor-pointer bg-transparent"
          aria-label="Abrir búsqueda (Ctrl+K)">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
          <span>Buscar</span>
          <kbd className="text-[11px] border border-[rgba(255,255,255,0.12)] rounded px-1 py-0.5">⌘K</kbd>
        </button>

        {/* Density toggle */}
        <button
          onClick={onDensityToggle}
          title={density === 'comfortable' ? 'Cambiar a modo compacto' : 'Cambiar a modo confortable'}
          className="p-2 rounded-lg text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer bg-transparent border-none"
          aria-label="Alternar densidad de tabla">
          {density === 'comfortable'
            ? <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 6h18M3 10h18M3 14h18M3 18h18"/></svg>
            : <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 5h18M3 9h18M3 13h18M3 17h18M3 21h18"/></svg>
          }
        </button>

        {/* Notifications */}
        <button
          onClick={onViewPending}
          className="relative p-2 rounded-lg text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer bg-transparent border-none"
          aria-label="Ver solicitudes pendientes">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/></svg>
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#AAFF00] text-[10px] font-black text-black">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className="w-px h-7 bg-[rgba(255,255,255,0.08)]" />

        {/* View site */}
        <button onClick={onViewSite}
          className="hidden lg:flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.4)] hover:text-white border border-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 transition-all cursor-pointer bg-transparent"
          aria-label="Ver sitio público en nueva pestaña">
          Ver sitio
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 5h5v5"/><path d="M10 14 19 5"/><path d="M19 14v5H5V5h5"/></svg>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-[14px] font-semibold text-white leading-tight">{user?.name || 'Administrador'}</p>
            <p className="text-[11px] font-bold text-[#AAFF00]">{roleLabel}</p>
          </div>
          {photoURL
            ? <Image src={photoURL} alt="Avatar" width={36} height={36} className="rounded-full object-cover ring-2 ring-[rgba(170,255,0,0.3)]" />
            : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#AAFF00] to-[#7B3FF6] flex items-center justify-center text-[12px] font-black text-black shrink-0">
                {initials}
              </div>
          }
        </div>
      </div>
    </header>
  )
}
