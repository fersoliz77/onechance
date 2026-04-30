'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import InlineFiltersBar from '@/components/ui/InlineFiltersBar'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import AgentCard from '@/features/agents/components/AgentCard'
import { emptyAgentFilters, useAgentsListing } from '@/features/agents/hooks/useAgentsListing'
import { COUNTRIES } from '@/types'

export default function RepresentantesPage() {
  const { agents, visible, loading, search, setSearch, filters, setFilters } = useAgentsListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block">
          <ListPageHeader
            count={visible.length}
            entityLabel="REPRESENTANTES"
            title="Representantes"
            subtitle={`Agentes y representantes deportivos · Mercados internacionales · ${COUNTRIES.length} países`}
            tone="purple"
          />
          <InlineFiltersBar>
            <Input placeholder="Buscar por nombre o agencia..." value={search} onChange={e => setSearch(e.target.value)} icon="🤝" wrapperClass="w-full sm:max-w-[420px]" />
            <Select value={filters.nationality} onChange={e => setFilters({ ...filters, nationality: e.target.value })} className="w-full sm:w-[220px]" options={[{ value: '', label: 'Todos los países' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
            <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center" onClick={() => setFilters(emptyAgentFilters)}>Limpiar</Button>
          </InlineFiltersBar>
          <div className="flex-1">
            {loading ? (
              <EmptyState message="Cargando representantes..." />
            ) : visible.length === 0 ? (
              <EmptyState message={agents.length === 0 ? 'Aún no hay representantes registrados. Sé el primero.' : 'No se encontraron representantes con esos filtros.'} />
            ) : (
              <div className="oc-list-grid">
                {visible.map(a => <AgentCard key={a.uid} agent={a} onClick={() => router.push(`/representantes/${a.uid}`)} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
