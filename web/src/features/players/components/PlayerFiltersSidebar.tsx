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
  const renderPills = (opts: { value: string; label: string }[], keyName: keyof PlayerFilters) => (
    <div className="flex gap-1.5 flex-wrap">
      {opts.map(o => (
        <div
          key={o.value}
          onClick={() => setFilters({ ...filters, [keyName]: o.value })}
          className="px-[10px] py-1 rounded-[20px] text-[10px] sm:text-[9px] cursor-pointer transition-all duration-150"
          style={{
            background: filters[keyName] === o.value ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${filters[keyName] === o.value ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: filters[keyName] === o.value ? '#00C853' : 'rgba(255,255,255,0.35)',
          }}
        >
          {o.label}
        </div>
      ))}
    </div>
  )

  return (
    <aside className="w-full md:w-[280px] shrink-0 bg-[var(--oc-surface-1)] border border-[var(--oc-border-soft)] rounded-[12px] p-3 sm:p-4 md:sticky md:top-[calc(var(--oc-nav-height)+var(--oc-space-4))] self-start">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white text-[14px] sm:text-[12px] font-medium">Filtros</span>
        <button onClick={onClear} className="text-[rgba(0,200,83,0.75)] text-[11px] sm:text-[10px] cursor-pointer bg-transparent border-none">Limpiar</button>
      </div>
      <div className="mb-3.5">
        <SectionKicker className="mb-1.5">Sexo</SectionKicker>
        {renderPills([{ value: '', label: 'Todos' }, { value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }], 'gender')}
      </div>
      <div className="mb-3.5">
        <SectionKicker className="mb-1.5">Categoría</SectionKicker>
        {renderPills([{ value: '', label: 'Todos' }, { value: '13-17', label: '13-17' }, { value: '18-22', label: '18-22' }, { value: '23-30', label: '23-30' }], 'ageRange')}
      </div>
      <div className="mb-3.5">
        <SectionKicker className="mb-1.5">Puesto</SectionKicker>
        <Select
          value={filters.position}
          onChange={e => setFilters({ ...filters, position: e.target.value })}
          options={[{ value: '', label: 'Todos' }, ...POSITIONS.map(p => ({ value: p, label: p }))]}
        />
      </div>
      <div className="mb-3.5">
        <SectionKicker className="mb-1.5">Nacionalidad</SectionKicker>
        <Select
          value={filters.nationality}
          onChange={e => setFilters({ ...filters, nationality: e.target.value })}
          options={[{ value: '', label: 'Todos' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]}
        />
      </div>
      <div className="mb-3.5">
        <SectionKicker className="mb-1.5">Pierna</SectionKicker>
        {renderPills([{ value: '', label: 'Todos' }, { value: 'Der', label: 'Derecho' }, { value: 'Izq', label: 'Izquierdo' }], 'strongFoot')}
      </div>
    </aside>
  )
}
