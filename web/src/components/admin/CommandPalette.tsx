'use client'
import { useEffect, useRef, useState } from 'react'
import type { AdminTab } from '@/app/admin/page'

interface NavItem { label: string; tab: AdminTab; keywords?: string[] }
interface ActionItem { label: string; icon: string; action: () => void }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       tab: 'dashboard',     keywords: ['inicio','panel','overview'] },
  { label: 'Perfiles',        tab: 'perfiles',      keywords: ['jugadores','técnicos','clubes'] },
  { label: 'Usuarios',        tab: 'usuarios',      keywords: ['user','people','accounts'] },
  { label: 'Solicitudes',     tab: 'solicitudes',   keywords: ['pendientes','pending','aprobar'] },
  { label: 'Videos',          tab: 'videos',        keywords: ['media','clips'] },
  { label: 'Estadísticas',    tab: 'estadisticas',  keywords: ['stats','charts','analytics'] },
  { label: 'Suscripciones',   tab: 'suscripciones', keywords: ['billing','planes'] },
  { label: 'Moderación',      tab: 'moderacion',    keywords: ['reports','ban'] },
  { label: 'Configuración',   tab: 'configuracion', keywords: ['settings','ajustes'] },
]

interface Props {
  open: boolean
  onClose: () => void
  onNav: (tab: AdminTab) => void
  extraActions?: ActionItem[]
}

export default function CommandPalette({ open, onClose, onNav, extraActions = [] }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => { setQuery(''); inputRef.current?.focus() }, 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const q = query.toLowerCase().trim()

  const filteredNav = NAV_ITEMS.filter(item =>
    !q || item.label.toLowerCase().includes(q) || item.keywords?.some(k => k.includes(q))
  )
  const filteredActions = extraActions.filter(a =>
    !q || a.label.toLowerCase().includes(q)
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[18vh] px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-[540px] rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#111111] shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden"
        style={{ animation: 'oc-fadeUp 0.15s ease both' }}
        onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <svg className="w-4 h-4 text-[rgba(255,255,255,0.3)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar sección o acción…"
            className="flex-1 bg-transparent text-white text-[16px] outline-none placeholder:text-[rgba(255,255,255,0.25)]"
            aria-label="Búsqueda del panel de administración"
          />
          <kbd className="text-[11px] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.25)]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto py-2">
          {filteredNav.length > 0 && (
            <div>
              <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.25)]">Navegación</p>
              {filteredNav.map(item => (
                <button key={item.tab}
                  onClick={() => { onNav(item.tab); onClose() }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer bg-transparent border-none group">
                  <span className="w-7 h-7 rounded-lg bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.18)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(170,255,0,0.14)] transition-colors">
                    <svg className="w-3.5 h-3.5 text-[rgba(170,255,0,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
                  </span>
                  <span className="text-[15px] text-[rgba(255,255,255,0.75)] group-hover:text-white transition-colors">{item.label}</span>
                  <span className="ml-auto text-[12px] text-[rgba(255,255,255,0.2)]">Tab</span>
                </button>
              ))}
            </div>
          )}

          {filteredActions.length > 0 && (
            <div className="mt-1">
              <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.25)]">Acciones</p>
              {filteredActions.map(a => (
                <button key={a.label}
                  onClick={() => { a.action(); onClose() }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer bg-transparent border-none">
                  <span className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0 text-[15px]">{a.icon}</span>
                  <span className="text-[15px] text-[rgba(255,255,255,0.75)]">{a.label}</span>
                </button>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <div className="py-12 text-center text-[rgba(255,255,255,0.2)] text-sm">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[rgba(255,255,255,0.06)] text-[12px] text-[rgba(255,255,255,0.2)]">
          <span><kbd className="border border-[rgba(255,255,255,0.12)] rounded px-1">↵</kbd> seleccionar</span>
          <span><kbd className="border border-[rgba(255,255,255,0.12)] rounded px-1">ESC</kbd> cerrar</span>
        </div>
      </div>
    </div>
  )
}
