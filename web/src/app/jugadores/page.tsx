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
  const { players, visible, loading, search, setSearch, filters, setFilters } = usePlayersListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block">
          <ListPageHeader
            count={visible.length}
            entityLabel="JUGADORES"
            title="Jugadores"
            subtitle={`Masculino y femenino · Todas las categorías · ${COUNTRIES.length} países`}
            tone="green"
          />
          <Input placeholder="Buscar por nombre o puesto..." value={search} onChange={e => setSearch(e.target.value)} icon="⚽" wrapperClass="mb-4 sm:mb-6 lg:mb-7 w-full md:max-w-[460px]" />
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-start">
            <PlayerFiltersSidebar filters={filters} setFilters={setFilters} onClear={() => setFilters(emptyPlayerFilters)} />
            <div className="flex-1 w-full">
              {loading ? (
                <EmptyState message="Cargando jugadores..." />
              ) : visible.length === 0 ? (
                <EmptyState message={players.length === 0 ? 'Aún no hay jugadores registrados. Sé el primero.' : 'No se encontraron jugadores con esos filtros.'} />
              ) : (
                <div className="oc-list-grid">
                  {visible.map(p => <PlayerCard key={p.uid} player={p} onClick={() => router.push(`/jugadores/${p.uid}`)} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
