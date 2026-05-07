'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import PlayerCard from '@/features/players/components/PlayerCard'
import PlayerFiltersSidebar from '@/features/players/components/PlayerFiltersSidebar'
import { emptyPlayerFilters, usePlayersListing } from '@/features/players/hooks/usePlayersListing'
import { COUNTRIES } from '@/types'

export default function JugadoresPage() {
  const { players, visible, loading, error, reload, search, setSearch, filters, setFilters } = usePlayersListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(170,255,0,0.1),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.08),transparent_30%)]" />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <section className="relative overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2200&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative px-[var(--oc-space-5)] pb-[var(--oc-space-6)] pt-[var(--oc-space-4)] md:px-[var(--oc-space-8)] md:pb-[var(--oc-space-8)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[13px] font-[700] text-[var(--oc-fg-muted)]">
                <div className="flex items-center gap-2">
                  <span className="text-white">Inicio</span>
                  <span>›</span>
                  <span>Jugadores</span>
                  <span>›</span>
                  <span>Buscador</span>
                </div>
                <div className="rounded-[8px] border border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 text-[var(--oc-lime)]">
                  {visible.length} perfiles disponibles
                </div>
              </div>

              <div className="grid grid-cols-1 gap-[var(--oc-space-6)] lg:grid-cols-[1fr_300px] lg:items-end">
                <div>
                  <ListPageHeader
                    count={visible.length}
                    entityLabel="JUGADORES"
                    title="Jugadores"
                    subtitle={`Masculino y femenino · Todas las categorías · ${COUNTRIES.length} países`}
                    tone="green"
                  />
                  <Input placeholder="Buscar por nombre o puesto..." value={search} onChange={e => setSearch(e.target.value)} icon="⚽" wrapperClass="mb-0 mt-4 w-full md:max-w-[520px]" />
                </div>
                <div className="rounded-[var(--oc-radius-lg)] border border-[var(--oc-border-soft)] bg-[rgba(6,19,24,0.86)] p-[var(--oc-space-5)]">
                  <p className="text-[12px] uppercase tracking-[0.06em] text-[var(--oc-fg-dim)]">Resumen</p>
                  <p className="mt-1 text-[27px] font-[800] tracking-[-0.02em] text-[var(--oc-lime)]">{visible.length}</p>
                  <p className="text-[13px] text-[var(--oc-fg-muted)]">Perfiles que coinciden con tus filtros</p>
                </div>
              </div>
            </div>
          </section>

          <nav role="tablist" className="grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[13px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6" aria-label="Secciones de resultados">
            {['Resumen', 'Filtros', 'Resultados', 'Scout view', 'Videos', 'Fotos'].map((tab, i) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={i === 0}
                className={`flex items-center justify-center border-b-2 ${i === 0 ? 'border-[var(--oc-lime)] text-[var(--oc-lime)]' : 'border-transparent'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="mt-[var(--oc-space-5)] flex flex-col items-start gap-[var(--oc-space-4)] md:flex-row md:gap-[var(--oc-space-5)]">
            <PlayerFiltersSidebar filters={filters} setFilters={setFilters} onClear={() => setFilters(emptyPlayerFilters)} />
            <div className="w-full flex-1">
              {loading ? (
                <EmptyState message="Cargando jugadores..." />
              ) : error ? (
                <div className="rounded-[12px] border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.08)] p-5 text-[13px] text-[rgba(255,220,140,0.95)]">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => void reload()}
                    className="mt-3 rounded-[8px] border border-[rgba(255,255,255,0.2)] px-3 py-2 text-[12px] font-[700] text-white"
                  >
                    Reintentar
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <EmptyState message={players.length === 0 ? 'Aún no hay jugadores registrados. Sé el primero.' : 'No se encontraron jugadores con esos filtros.'} />
              ) : (
                <div className="oc-list-grid">
                  {visible.map((p) => <PlayerCard key={p.uid} player={p} onClick={() => router.push(`/jugadores/${p.uid}`)} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
