'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import InlineFiltersBar from '@/components/ui/InlineFiltersBar'
import EmptyState from '@/components/ui/EmptyState'
import CoachCard from '@/features/coaches/components/CoachCard'
import { useCoachesListing } from '@/features/coaches/hooks/useCoachesListing'
import { COUNTRIES } from '@/types'

export default function TecnicosPage() {
  const { coaches, visible, loading, search, setSearch, filters, setFilters } = useCoachesListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block">
          <ListPageHeader
            count={visible.length}
            entityLabel="TECNICOS"
            title="Técnicos"
            subtitle={`Entrenadores y cuerpo técnico · Todas las categorías · ${COUNTRIES.length} países`}
            tone="blue"
          />
          <InlineFiltersBar>
            <Input placeholder="Buscar por nombre o club..." value={search} onChange={e => setSearch(e.target.value)} icon="📋" wrapperClass="w-full sm:max-w-[420px]" />
            <Select value={filters.nationality} onChange={e => setFilters({ ...filters, nationality: e.target.value })} className="w-full sm:w-[220px]" options={[{ value: '', label: 'Todos los países' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
            <Select value={filters.minYears} onChange={e => setFilters({ ...filters, minYears: e.target.value })} className="w-full sm:w-[180px]" options={[{ value: '', label: 'Experiencia' }, { value: '5', label: '5+ años' }, { value: '10', label: '10+ años' }, { value: '15', label: '15+ años' }]} />
          </InlineFiltersBar>
          <div className="flex-1">
            {loading ? (
                <EmptyState message="Cargando técnicos..." />
              ) : visible.length === 0 ? (
                <EmptyState message={coaches.length === 0 ? 'Aún no hay técnicos registrados. Sé el primero.' : 'No se encontraron técnicos con esos filtros.'} />
            ) : (
              <div className="oc-list-grid">
                {visible.map(c => <CoachCard key={c.uid} coach={c} onClick={() => router.push(`/tecnicos/${c.uid}`)} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
