'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import ListPageHeader from '@/components/patterns/ListPageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import AgentCard from '@/features/agents/components/AgentCard'
import { emptyAgentFilters, useAgentsListing } from '@/features/agents/hooks/useAgentsListing'
import { COUNTRIES } from '@/types'

export default function RepresentantesPage() {
  const { agents, visible, loading, search, setSearch, filters, setFilters } = useAgentsListing()
  const router = useRouter()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(180,100,255,0.11),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <section className="relative overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=2200&auto=format&fit=crop')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative px-[var(--oc-space-5)] pb-[var(--oc-space-6)] pt-[var(--oc-space-4)] md:px-[var(--oc-space-8)] md:pb-[var(--oc-space-8)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[13px] font-[700] text-[var(--oc-fg-muted)]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-white">Inicio</span>
                  <span>›</span>
                  <span>Representantes</span>
                  <span>›</span>
                  <span>Buscador</span>
                </div>
                <div className="rounded-[8px] border border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 text-[var(--oc-purple)]">
                  {visible.length} perfiles disponibles
                </div>
              </div>

              <div className="grid grid-cols-1 gap-[var(--oc-space-6)] lg:grid-cols-[1fr_300px] lg:items-end">
                <div>
                  <ListPageHeader
                    count={visible.length}
                    entityLabel="REPRESENTANTES"
                    title="Representantes"
                    subtitle={`Agentes y representantes deportivos · Mercados internacionales · ${COUNTRIES.length} países`}
                    tone="purple"
                  />
                  <Input placeholder="Buscar por nombre o agencia..." value={search} onChange={e => setSearch(e.target.value)} icon="🤝" wrapperClass="mb-0 mt-4 w-full md:max-w-[520px]" />
                </div>
                <div className="rounded-[var(--oc-radius-lg)] border border-[var(--oc-border-soft)] bg-[rgba(6,19,24,0.86)] p-[var(--oc-space-5)]">
                  <p className="text-[12px] uppercase tracking-[0.06em] text-[var(--oc-fg-dim)]">Resumen</p>
                  <p className="mt-1 text-[27px] font-[800] tracking-[-0.02em] text-[var(--oc-purple)]">{visible.length}</p>
                  <p className="text-[13px] text-[var(--oc-fg-muted)]">Perfiles que coinciden con tus filtros</p>
                </div>
              </div>
            </div>
          </section>
          <nav className="flex overflow-x-auto rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-[13px] font-[700] text-[var(--oc-fg-muted)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {['Resumen', 'Filtros', 'Representantes', 'Mercados', 'Videos', 'Contacto'].map((tab, i) => (
              <div key={tab} className={`h-12 flex-1 min-w-[80px] shrink-0 flex items-center justify-center whitespace-nowrap px-2 border-b-2 ${i === 0 ? 'border-[var(--oc-purple)] text-[var(--oc-purple)]' : 'border-transparent'}`}>{tab}</div>
            ))}
          </nav>
          <div className="mt-[var(--oc-space-5)] flex flex-col items-start gap-[var(--oc-space-4)] md:flex-row md:gap-[var(--oc-space-5)]">
            <aside className="w-full shrink-0 rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] shadow-[0_0_0_1px_rgba(180,100,255,0.08),0_18px_50px_rgba(0,0,0,0.35)] md:sticky md:top-[calc(var(--oc-nav-height)+var(--oc-space-4))] md:w-[300px] self-start">
              <button type="button" onClick={() => setFiltersOpen(o => !o)} className="w-full flex items-center justify-between p-[var(--oc-space-4)] md:cursor-default" aria-expanded={filtersOpen}>
                <span className="flex items-center gap-2 text-[15px] font-[700] text-white">
                  Filtros
                  {activeFilters > 0 && <span className="inline-flex items-center justify-center h-[18px] min-w-[18px] rounded-full bg-[rgba(180,100,255,0.15)] text-[var(--oc-purple)] text-[10px] font-bold px-1">{activeFilters}</span>}
                </span>
                <div className="flex items-center gap-3">
                  {activeFilters > 0 && <button type="button" onClick={e => { e.stopPropagation(); setFilters(emptyAgentFilters) }} className="cursor-pointer border-none bg-transparent text-[12px] text-[var(--oc-purple)]">Limpiar</button>}
                  <svg className={`w-4 h-4 text-[rgba(255,255,255,0.3)] transition-transform duration-200 md:hidden ${filtersOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out md:block ${filtersOpen ? 'max-h-[300px]' : 'max-h-0 md:max-h-none'}`}>
                <div className="px-[var(--oc-space-4)] pb-[var(--oc-space-4)]">
                  <p className="mb-1.5 text-[12px] text-[var(--oc-text-faint)]">Nacionalidad</p>
                  <Select value={filters.nationality} onChange={e => setFilters({ ...filters, nationality: e.target.value })} options={[{ value: '', label: 'Todos los países' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
                </div>
              </div>
            </aside>

            <div className="w-full flex-1">
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
    </div>
  )
}
