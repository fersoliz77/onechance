'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import InlineFiltersBar from '@/components/ui/InlineFiltersBar'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import ClubCard from '@/features/clubs/components/ClubCard'
import { DIVISIONS, emptyClubFilters, useClubsListing } from '@/features/clubs/hooks/useClubsListing'
import { COUNTRIES } from '@/types'

export default function ClubesPage() {
  const { clubs, visible, loading, search, setSearch, filters, setFilters } = useClubsListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block">
          <ListPageHeader
            count={visible.length}
            entityLabel="CLUBES"
            title="Clubes"
            subtitle={`Instituciones de fútbol · Todas las divisiones · ${COUNTRIES.length} países`}
            tone="yellow"
          />
          <InlineFiltersBar>
            <Input placeholder="Buscar por nombre o ciudad..." value={search} onChange={e => setSearch(e.target.value)} icon="🏟️" wrapperClass="w-full sm:max-w-[420px]" />
            <Select value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })} className="w-full sm:w-[220px]" options={[{ value: '', label: 'Todos los países' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
            <Select value={filters.division} onChange={e => setFilters({ ...filters, division: e.target.value })} className="w-full sm:w-[220px]" options={[{ value: '', label: 'Todas las divisiones' }, ...DIVISIONS.map(d => ({ value: d, label: d }))]} />
            <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center" onClick={() => setFilters(emptyClubFilters)}>Limpiar</Button>
          </InlineFiltersBar>
          <div className="flex-1">
            {loading ? (
              <EmptyState message="Cargando clubes..." />
            ) : visible.length === 0 ? (
              <EmptyState message={clubs.length === 0 ? 'Aún no hay clubes registrados. Sé el primero.' : 'No se encontraron clubes con esos filtros.'} />
            ) : (
              <div className="oc-list-grid">
                {visible.map(c => <ClubCard key={c.uid} club={c} onClick={() => router.push(`/clubes/${c.uid}`)} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
