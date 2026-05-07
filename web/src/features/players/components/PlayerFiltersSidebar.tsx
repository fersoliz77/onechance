'use client'
import { useState } from 'react'
import Select from '@/components/ui/Select'
import SectionKicker from '@/components/ui/SectionKicker'
import { COUNTRIES, POSITIONS } from '@/types'
import type { PlayerFilters } from '@/features/players/hooks/usePlayersListing'

type Props = {
  filters: PlayerFilters
  setFilters: (next: PlayerFilters) => void
  onClear: () => void
}

export default function PlayerFiltersSidebar({ filters, setFilters, onClear }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCount = Object.values(filters).filter(Boolean).length

  const renderPills = (opts: { value: string; label: string }[], keyName: keyof PlayerFilters) => (
    <div className="flex gap-1.5 flex-wrap">
      {opts.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => setFilters({ ...filters, [keyName]: o.value })}
          className="px-[10px] py-1 rounded-[20px] text-[11px] sm:text-[10px] cursor-pointer transition-all duration-150"
          style={{
            background: filters[keyName] === o.value ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${filters[keyName] === o.value ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: filters[keyName] === o.value ? '#00C853' : 'rgba(255,255,255,0.35)',
          }}
          aria-pressed={filters[keyName] === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

  return (
    <aside className="w-full shrink-0 rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] shadow-[0_0_0_1px_rgba(0,212,255,0.04),0_18px_50px_rgba(0,0,0,0.35)] md:sticky md:top-[calc(var(--oc-nav-height)+var(--oc-space-4))] md:w-[300px] self-start">
      {/* Header — toggle en mobile, siempre visible */}
      <button
        type="button"
        onClick={() => setMobileOpen(o => !o)}
        className="w-full flex items-center justify-between p-[var(--oc-space-4)] md:cursor-default"
        aria-expanded={mobileOpen}
      >
        <span className="flex items-center gap-2 text-[15px] font-[700] text-white">
          Filtros
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-[18px] min-w-[18px] rounded-full bg-[rgba(0,200,83,0.15)] text-[#00C853] text-[10px] font-bold px-1">
              {activeCount}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onClear() }}
              className="cursor-pointer border-none bg-transparent text-[12px] text-[var(--oc-lime)]"
            >
              Limpiar
            </button>
          )}
          <svg
            className={`w-4 h-4 text-[rgba(255,255,255,0.3)] transition-transform duration-200 md:hidden ${mobileOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Body — colapsable en mobile, siempre visible en md+ */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out md:block ${mobileOpen ? 'max-h-[600px]' : 'max-h-0 md:max-h-none'}`}>
        <div className="px-[var(--oc-space-4)] pb-[var(--oc-space-4)] space-y-3.5">
          <div>
            <SectionKicker className="mb-1.5">Sexo</SectionKicker>
            {renderPills([{ value: '', label: 'Todos' }, { value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }], 'gender')}
          </div>
          <div>
            <SectionKicker className="mb-1.5">Categoría</SectionKicker>
            {renderPills([{ value: '', label: 'Todos' }, { value: '13-17', label: '13-17' }, { value: '18-22', label: '18-22' }, { value: '23-30', label: '23-30' }], 'ageRange')}
          </div>
          <div>
            <SectionKicker className="mb-1.5">Puesto</SectionKicker>
            <Select
              value={filters.position}
              onChange={e => setFilters({ ...filters, position: e.target.value })}
              options={[{ value: '', label: 'Todos' }, ...POSITIONS.map(p => ({ value: p, label: p }))]}
            />
          </div>
          <div>
            <SectionKicker className="mb-1.5">Nacionalidad</SectionKicker>
            <Select
              value={filters.nationality}
              onChange={e => setFilters({ ...filters, nationality: e.target.value })}
              options={[{ value: '', label: 'Todos' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]}
            />
          </div>
          <div>
            <SectionKicker className="mb-1.5">Pierna</SectionKicker>
            {renderPills([{ value: '', label: 'Todos' }, { value: 'Der', label: 'Derecho' }, { value: 'Izq', label: 'Izquierdo' }], 'strongFoot')}
          </div>
        </div>
      </div>
    </aside>
  )
}
