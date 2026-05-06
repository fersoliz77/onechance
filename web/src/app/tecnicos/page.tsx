'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import CoachCard from '@/features/coaches/components/CoachCard'
import { emptyCoachFilters, useCoachesListing } from '@/features/coaches/hooks/useCoachesListing'
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
          <section className="relative overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2200&auto=format&fit=crop')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative px-[var(--oc-space-5)] pb-[var(--oc-space-6)] pt-[var(--oc-space-4)] md:px-[var(--oc-space-8)] md:pb-[var(--oc-space-8)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[12px] font-[700] text-[var(--oc-fg-muted)]">
                <div className="flex items-center gap-2">
                  <span className="text-white">Inicio</span>
                  <span>›</span>
                  <span>Técnicos</span>
                  <span>›</span>
                  <span>Buscador</span>
                </div>
                <div className="rounded-[8px] border border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 text-[var(--oc-blue)]">
                  {visible.length} perfiles disponibles
                </div>
              </div>

              <div className="grid grid-cols-1 gap-[var(--oc-space-6)] lg:grid-cols-[1fr_300px] lg:items-end">
                <div>
                  <ListPageHeader
                    count={visible.length}
                    entityLabel="TECNICOS"
                    title="Técnicos"
                    subtitle={`Entrenadores y cuerpo técnico · Todas las categorías · ${COUNTRIES.length} países`}
                    tone="blue"
                  />
                  <Input placeholder="Buscar por nombre o club..." value={search} onChange={e => setSearch(e.target.value)} icon="📋" wrapperClass="mb-0 mt-4 w-full md:max-w-[520px]" />
                </div>
                <div className="rounded-[var(--oc-radius-lg)] border border-[var(--oc-border-soft)] bg-[rgba(6,19,24,0.86)] p-[var(--oc-space-5)]">
                  <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--oc-fg-dim)]">Resumen</p>
                  <p className="mt-1 text-[26px] font-[800] tracking-[-0.02em] text-[var(--oc-blue)]">{visible.length}</p>
                  <p className="text-[12px] text-[var(--oc-fg-muted)]">Perfiles que coinciden con tus filtros</p>
                </div>
              </div>
            </div>
          </section>
          <nav className="grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[12px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6">
            {['Resumen', 'Filtros', 'Tecnicos', 'Experiencia', 'Videos', 'Contacto'].map((tab, i) => (
              <div key={tab} className={`flex items-center justify-center border-b-2 ${i === 0 ? 'border-[var(--oc-blue)] text-[var(--oc-blue)]' : 'border-transparent'}`}>{tab}</div>
            ))}
          </nav>
          <div className="mt-[var(--oc-space-5)] flex flex-col items-start gap-[var(--oc-space-4)] md:flex-row md:gap-[var(--oc-space-5)]">
            <aside className="w-full shrink-0 rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] p-[var(--oc-space-4)] shadow-[0_0_0_1px_rgba(90,143,255,0.08),0_18px_50px_rgba(0,0,0,0.35)] md:sticky md:top-[calc(var(--oc-nav-height)+var(--oc-space-4))] md:w-[300px] self-start">
              <div className="mb-[var(--oc-space-4)] flex items-center justify-between">
                <span className="text-[14px] font-[700] text-white">Filtros</span>
                <button onClick={() => setFilters(emptyCoachFilters)} className="cursor-pointer border-none bg-transparent text-[11px] text-[var(--oc-blue)]">Limpiar</button>
              </div>
              <div className="mb-3.5">
                <p className="mb-1.5 text-[11px] text-[var(--oc-text-faint)]">Nacionalidad</p>
                <Select value={filters.nationality} onChange={e => setFilters({ ...filters, nationality: e.target.value })} options={[{ value: '', label: 'Todos los países' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
              </div>
              <div className="mb-3.5">
                <p className="mb-1.5 text-[11px] text-[var(--oc-text-faint)]">Experiencia mínima</p>
                <Select value={filters.minYears} onChange={e => setFilters({ ...filters, minYears: e.target.value })} options={[{ value: '', label: 'Todas' }, { value: '5', label: '5+ años' }, { value: '10', label: '10+ años' }, { value: '15', label: '15+ años' }]} />
              </div>
            </aside>

            <div className="w-full flex-1">
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
    </div>
  )
}
