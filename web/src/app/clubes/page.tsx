'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import ClubCard from '@/features/clubs/components/ClubCard'
import { DIVISIONS, emptyClubFilters, useClubsListing } from '@/features/clubs/hooks/useClubsListing'
import { COUNTRIES } from '@/types'

export default function ClubesPage() {
  const { clubs, visible, loading, search, setSearch, filters, setFilters } = useClubsListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(255,180,0,0.1),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <section className="relative overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2200&auto=format&fit=crop')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative px-[var(--oc-space-5)] pb-[var(--oc-space-6)] pt-[var(--oc-space-4)] md:px-[var(--oc-space-8)] md:pb-[var(--oc-space-8)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[13px] font-[700] text-[var(--oc-fg-muted)]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-white">Inicio</span>
                  <span>›</span>
                  <span>Clubes</span>
                  <span>›</span>
                  <span>Buscador</span>
                </div>
                <div className="rounded-[8px] border border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 text-[var(--oc-yellow)]">
                  {visible.length} perfiles disponibles
                </div>
              </div>

              <div className="grid grid-cols-1 gap-[var(--oc-space-6)] lg:grid-cols-[1fr_300px] lg:items-end">
                <div>
                  <ListPageHeader
                    count={visible.length}
                    entityLabel="CLUBES"
                    title="Clubes"
                    subtitle={`Instituciones de futbol · Todas las divisiones · ${COUNTRIES.length} países`}
                    tone="yellow"
                  />
                  <Input placeholder="Buscar por nombre o ciudad..." value={search} onChange={e => setSearch(e.target.value)} icon="🔎" wrapperClass="mb-0 mt-4 w-full md:max-w-[520px]" />
                </div>
                <div className="rounded-[var(--oc-radius-lg)] border border-[var(--oc-border-soft)] bg-[rgba(6,19,24,0.86)] p-[var(--oc-space-5)]">
                  <p className="text-[12px] uppercase tracking-[0.06em] text-[var(--oc-fg-dim)]">Resumen</p>
                  <p className="mt-1 text-[27px] font-[800] tracking-[-0.02em] text-[var(--oc-yellow)]">{visible.length}</p>
                  <p className="text-[13px] text-[var(--oc-fg-muted)]">Perfiles que coinciden con tus filtros</p>
                </div>
              </div>
            </div>
          </section>

          <nav className="grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[13px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6">
            {['Resumen', 'Filtros', 'Clubes', 'Categorias', 'Ciudades', 'Contacto'].map((tab, i) => (
              <div key={tab} className={`flex items-center justify-center border-b-2 ${i === 0 ? 'border-[var(--oc-yellow)] text-[var(--oc-yellow)]' : 'border-transparent'}`}>{tab}</div>
            ))}
          </nav>

          <div className="mt-[var(--oc-space-5)] grid gap-4 lg:grid-cols-[300px_1fr] lg:gap-5">
            <aside className="self-start rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] p-[var(--oc-space-4)] shadow-[0_0_0_1px_rgba(255,180,0,0.06),0_18px_50px_rgba(0,0,0,0.35)] lg:sticky lg:top-[calc(var(--oc-nav-height)+var(--oc-space-4))]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[15px] font-[700] text-white">Filtros</span>
                <button onClick={() => setFilters(emptyClubFilters)} className="text-[12px] text-oc-yellow">Limpiar</button>
              </div>
              <div className="space-y-3.5">
                <div>
                  <p className="mb-1.5 text-[12px] text-[var(--oc-text-faint)]">Pais</p>
                  <Select value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })} options={[{ value: '', label: 'Todos los paises' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] text-[var(--oc-text-faint)]">Division actual</p>
                  <Select value={filters.division} onChange={e => setFilters({ ...filters, division: e.target.value })} options={[{ value: '', label: 'Todas las divisiones' }, ...DIVISIONS.map(d => ({ value: d, label: d }))]} />
                </div>
              </div>

              <div className="mt-5 rounded-[10px] border border-[rgba(255,180,0,0.34)] bg-[rgba(255,180,0,0.08)] p-4">
                <h3 className="text-[18px] font-semibold text-white">Sos un club?</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--oc-text-muted)]">Publica tu perfil institucional y conecta con jugadores, tecnicos y representantes.</p>
              </div>
            </aside>

            <div className="flex-1">
              <p className="mb-3 text-[13px] text-[var(--oc-text-faint)]">{visible.length} resultados</p>
            {loading ? (
              <EmptyState message="Cargando clubes..." />
            ) : visible.length === 0 ? (
              <EmptyState message={clubs.length === 0 ? 'Aún no hay clubes registrados. Sé el primero.' : 'No se encontraron clubes con esos filtros.'} />
            ) : (
              <div className="space-y-3">
                {visible.map(c => <ClubCard key={c.uid} club={c} onClick={() => router.push(`/clubes/${c.uid}`)} />)}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
