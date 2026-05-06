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
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(90,143,255,0.11),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <section className="relative mb-5 overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2200&auto=format&fit=crop')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative p-[var(--oc-space-5)] md:p-[var(--oc-space-8)]">
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
            </div>
          </section>
          <nav className="mb-5 grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[12px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6">
            {['Resumen', 'Filtros', 'Tecnicos', 'Experiencia', 'Videos', 'Contacto'].map((tab, i) => (
              <div key={tab} className={`flex items-center justify-center border-b-2 ${i === 0 ? 'border-[var(--oc-blue)] text-[var(--oc-blue)]' : 'border-transparent'}`}>{tab}</div>
            ))}
          </nav>
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
