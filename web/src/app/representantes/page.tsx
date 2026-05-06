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
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(180,100,255,0.11),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <section className="relative mb-5 overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=2200&auto=format&fit=crop')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative p-[var(--oc-space-5)] md:p-[var(--oc-space-8)]">
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
            </div>
          </section>
          <nav className="mb-5 grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[12px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6">
            {['Resumen', 'Filtros', 'Representantes', 'Mercados', 'Videos', 'Contacto'].map((tab, i) => (
              <div key={tab} className={`flex items-center justify-center border-b-2 ${i === 0 ? 'border-[var(--oc-purple)] text-[var(--oc-purple)]' : 'border-transparent'}`}>{tab}</div>
            ))}
          </nav>
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
