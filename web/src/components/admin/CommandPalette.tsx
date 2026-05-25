'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { AdminTab } from '@/app/admin/page'

interface NavItem { label: string; tab: AdminTab; keywords?: string[] }
interface ActionItem { label: string; icon: string; action: () => void }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       tab: 'dashboard',     keywords: ['inicio','panel','overview'] },
  { label: 'Perfiles',        tab: 'perfiles',      keywords: ['jugadores','técnicos','clubes'] },
  { label: 'Usuarios',        tab: 'usuarios',      keywords: ['user','people','accounts'] },
  { label: 'Solicitudes',     tab: 'solicitudes',   keywords: ['pendientes','pending','aprobar'] },
  { label: 'Videos',          tab: 'videos',        keywords: ['media','clips'] },
  { label: 'Visitas',         tab: 'visitas',       keywords: ['visitors','trafico','profile views'] },
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => { setQuery(''); setSelectedIndex(0); inputRef.current?.focus() }, 50)
    }
  }, [open])

  const q = query.toLowerCase().trim()

  const filteredNav = NAV_ITEMS.filter(item =>
    !q || item.label.toLowerCase().includes(q) || item.keywords?.some(k => k.includes(q))
  )
  const filteredActions = extraActions.filter(a =>
    !q || a.label.toLowerCase().includes(q)
  )

  const allItems: Array<{ type: 'nav'; item: NavItem } | { type: 'action'; item: ActionItem }> = useMemo(() => [
    ...filteredNav.map(item => ({ type: 'nav' as const, item })),
    ...filteredActions.map(item => ({ type: 'action' as const, item })),
  ], [filteredNav, filteredActions])

  const execute = useCallback((idx: number) => {
    const entry = allItems[idx]
    if (!entry) return
    if (entry.type === 'nav') { onNav(entry.item.tab); onClose() }
    else { entry.item.action(); onClose() }
  }, [allItems, onNav, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, allItems.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        execute(selectedIndex)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, allItems.length, selectedIndex, execute])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  let globalIdx = 0

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
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Buscar sección o acción…"
            className="flex-1 bg-transparent text-white text-[16px] outline-none placeholder:text-[rgba(255,255,255,0.25)]"
            aria-label="Búsqueda del panel de administración"
          />
          <kbd className="text-[11px] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.25)]">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2">
          {filteredNav.length > 0 && (
            <div>
              <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.25)]">Navegación</p>
              {filteredNav.map(item => {
                const idx = globalIdx++
                const isSelected = idx === selectedIndex
                return (
                  <button key={item.tab}
                    data-idx={idx}
                    onClick={() => execute(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer bg-transparent border-none group"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: isSelected ? 'rgba(170,255,0,0.18)' : 'rgba(170,255,0,0.08)', border: `1px solid ${isSelected ? 'rgba(170,255,0,0.35)' : 'rgba(170,255,0,0.18)'}` }}>
                      <svg className="w-3.5 h-3.5" style={{ color: isSelected ? '#AAFF00' : 'rgba(170,255,0,0.6)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
                    </span>
                    <span className="text-[15px] transition-colors" style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.75)' }}>{item.label}</span>
                    <span className="ml-auto text-[12px] text-[rgba(255,255,255,0.2)]">Tab</span>
                  </button>
                )
              })}
            </div>
          )}

          {filteredActions.length > 0 && (
            <div className="mt-1">
              <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.25)]">Acciones</p>
              {filteredActions.map(a => {
                const idx = globalIdx++
                const isSelected = idx === selectedIndex
                return (
                  <button key={a.label}
                    data-idx={idx}
                    onClick={() => execute(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer bg-transparent border-none"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[15px]"
                      style={{ background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}>
                      {a.icon}
                    </span>
                    <span className="text-[15px] transition-colors" style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.75)' }}>{a.label}</span>
                  </button>
                )
              })}
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
          <span><kbd className="border border-[rgba(255,255,255,0.12)] rounded px-1">↑↓</kbd> navegar</span>
          <span><kbd className="border border-[rgba(255,255,255,0.12)] rounded px-1">↵</kbd> seleccionar</span>
          <span><kbd className="border border-[rgba(255,255,255,0.12)] rounded px-1">ESC</kbd> cerrar</span>
        </div>
      </div>
    </div>
  )
}
