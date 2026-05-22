'use client'
import { useState, useMemo } from 'react'
import { ROLE_ACCENT, ROLE_LABELS, ROLE_ROUTE, ROLE_COLLECTION } from '@/lib/constants'
import { STATUS_META } from '@/types'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, ProfileStatus, Role } from '@/types'
import RejectModal from '@/components/admin/ui/RejectModal'

// ── Unified row type ───────────────────────────────────────────────────────────

export type ProfileRow = {
  uid: string
  displayName: string
  role: Role
  col: string
  status: ProfileStatus
  subtitle: string      // position / nationality / country / agencyName
  isFeatured: boolean
}

function toRows(
  players: PlayerProfile[],
  coaches: CoachProfile[],
  clubs:   ClubProfile[],
  agents:  AgentProfile[],
): ProfileRow[] {
  return [
    ...players.map(p => ({
      uid: p.uid, displayName: p.fullName, role: 'player' as Role,
      col: ROLE_COLLECTION.player, status: p.status,
      subtitle: p.position ?? '', isFeatured: p.isFeatured ?? false,
    })),
    ...coaches.map(p => ({
      uid: p.uid, displayName: p.fullName, role: 'coach' as Role,
      col: ROLE_COLLECTION.coach, status: p.status,
      subtitle: p.nationality ?? '', isFeatured: false,
    })),
    ...clubs.map(p => ({
      uid: p.uid, displayName: p.name, role: 'club' as Role,
      col: ROLE_COLLECTION.club, status: p.status,
      subtitle: p.country ?? '', isFeatured: false,
    })),
    ...agents.map(p => ({
      uid: p.uid, displayName: p.fullName, role: 'agent' as Role,
      col: ROLE_COLLECTION.agent, status: p.status,
      subtitle: p.agencyName ?? '', isFeatured: false,
    })),
  ]
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  players:  PlayerProfile[]
  coaches:  CoachProfile[]
  clubs:    ClubProfile[]
  agents:   AgentProfile[]
  onToggleStatus: (uid: string, col: string, status: ProfileStatus) => Promise<void>
  onFeatured:     (uid: string, current: boolean) => Promise<void>
  onApprove:      (uid: string, col: string) => Promise<void>
  onReject:       (uid: string, col: string, reason: string) => Promise<void>
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const ROLE_FILTERS: { value: Role | 'all'; label: string }[] = [
  { value: 'all',    label: 'Todos' },
  { value: 'player', label: 'Jugadores' },
  { value: 'coach',  label: 'Técnicos' },
  { value: 'club',   label: 'Clubes' },
  { value: 'agent',  label: 'Representantes' },
]

function StatusBadge({ status }: { status: ProfileStatus }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {m.label}
    </span>
  )
}

function RolePill({ role }: { role: Role }) {
  const color  = ROLE_ACCENT[role]
  const label  = ROLE_LABELS[role]
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}18` }}>
      {label}
    </span>
  )
}

const PAGE_SIZE = 25

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminProfilesTab({ players, coaches, clubs, agents, onToggleStatus, onFeatured, onApprove, onReject }: Props) {
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<Role | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'all'>('all')
  const [page,         setPage]         = useState(1)
  const [toggling,     setToggling]     = useState<string | null>(null)
  const [featuring,    setFeaturing]    = useState<string | null>(null)
  const [approving,    setApproving]    = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<{ uid: string; col: string; displayName: string } | null>(null)

  const allRows = useMemo(
    () => toRows(players, coaches, clubs, agents),
    [players, coaches, clubs, agents],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allRows.filter(r => {
      if (roleFilter !== 'all'   && r.role   !== roleFilter)   return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (q && !r.displayName.toLowerCase().includes(q) && !r.subtitle.toLowerCase().includes(q)) return false
      return true
    })
  }, [allRows, roleFilter, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const counts = useMemo(() => ({
    published: allRows.filter(r => r.status === 'published').length,
    pending:   allRows.filter(r => r.status === 'pending').length,
    hidden:    allRows.filter(r => r.status === 'hidden').length,
    rejected:  allRows.filter(r => r.status === 'rejected').length,
  }), [allRows])

  const handleToggle = async (row: ProfileRow) => {
    if (toggling) return
    if (row.status !== 'published' && row.status !== 'hidden') return
    setToggling(row.uid)
    await onToggleStatus(row.uid, row.col, row.status)
    setToggling(null)
  }

  const handleFeatured = async (row: ProfileRow) => {
    if (featuring || row.role !== 'player') return
    setFeaturing(row.uid)
    await onFeatured(row.uid, row.isFeatured)
    setFeaturing(null)
  }

  const handleView = (row: ProfileRow) => {
    if (row.status !== 'published') return
    window.open(`/${ROLE_ROUTE[row.role]}/${row.uid}`, '_blank')
  }

  const handleApprove = async (row: ProfileRow) => {
    if (approving) return
    setApproving(row.uid)
    await onApprove(row.uid, row.col)
    setApproving(null)
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return
    const { uid, col } = rejectTarget
    setRejectTarget(null)
    await onReject(uid, col, reason)
  }

  const resetFilters = () => {
    setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1)
  }

  const statusPills: { key: ProfileStatus; label: string; count: number; color: string }[] = [
    { key: 'published', label: 'Publicados', count: counts.published, color: '#00C853' },
    { key: 'pending', label: 'Pendientes', count: counts.pending, color: '#FFB400' },
    { key: 'hidden', label: 'Ocultos', count: counts.hidden, color: 'rgba(255,255,255,0.35)' },
    { key: 'rejected', label: 'Rechazados', count: counts.rejected, color: '#FF3C3C' },
  ]

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Gestión de perfiles</h2>
          <p className="text-sm text-[rgba(255,255,255,0.35)] mt-0.5">
            {allRows.length} perfiles totales
          </p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:flex-wrap sm:overflow-visible sm:whitespace-normal">
          {statusPills.map(s => {
            const active = statusFilter === s.key
            return (
            <button
              key={s.key}
              type="button"
              onClick={() => { setStatusFilter(active ? 'all' : s.key); setPage(1) }}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full border transition-all cursor-pointer"
              style={{
                borderColor: active ? `${s.color}66` : 'rgba(255,255,255,0.08)',
                background: active ? `${s.color}1A` : 'rgba(255,255,255,0.03)',
              }}
              title={active ? `Quitar filtro ${s.label}` : `Filtrar por ${s.label}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              <span style={{ color: s.color }} className="font-semibold">{s.count}</span>
              <span className={active ? 'text-white' : 'text-[rgba(255,255,255,0.3)]'}>{s.label}</span>
            </button>
          )})}
          {statusFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => { setStatusFilter('all'); setPage(1) }}
              className="border-none bg-transparent text-[11px] text-[rgba(170,255,0,0.75)] hover:text-[#AAFF00] transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 focus-within:border-[rgba(170,255,0,0.35)] focus-within:bg-[rgba(170,255,0,0.03)]">
          <svg className="h-4 w-4 shrink-0 text-[rgba(255,255,255,0.25)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre…"
            className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-[rgba(255,255,255,0.2)]"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => { setRoleFilter(f.value as Role | 'all'); setPage(1) }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
              style={{
                background:   roleFilter === f.value ? 'rgba(170,255,0,0.1)' : 'rgba(255,255,255,0.04)',
                color:        roleFilter === f.value ? '#AAFF00' : 'rgba(255,255,255,0.45)',
                borderColor:  roleFilter === f.value ? 'rgba(170,255,0,0.3)' : 'rgba(255,255,255,0.08)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Perfil', 'Rol', 'Info', 'Estado', 'Destacado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgba(255,255,255,0.28)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => {
                const accent = ROLE_ACCENT[row.role]
                const isToggling  = toggling  === row.uid
                const isFeaturing = featuring === row.uid
                const isApproving = approving === row.uid
                const canToggle   = row.status === 'published' || row.status === 'hidden'
                const isPending   = row.status === 'pending'

                return (
                  <tr
                    key={`${row.col}-${row.uid}`}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.015)] transition-colors">

                    {/* Perfil */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                          style={{ background: `linear-gradient(135deg,${accent}55,${accent}22)`, color: accent, border: `1px solid ${accent}44` }}>
                          {(row.displayName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="font-medium text-white truncate max-w-[160px]" title={row.displayName}>
                          {row.displayName}
                        </span>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-5 py-3">
                      <RolePill role={row.role} />
                    </td>

                    {/* Info (posición / país / agencia) */}
                    <td className="px-5 py-3 text-[rgba(255,255,255,0.45)] text-[12px]">
                      {row.subtitle || '—'}
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-3">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Destacado — solo jugadores */}
                    <td className="px-5 py-3">
                      {row.role === 'player' ? (
                        <button
                          type="button"
                          disabled={isFeaturing}
                          onClick={() => handleFeatured(row)}
                          className="text-[12px] px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border-none"
                          style={{
                            background: row.isFeatured ? 'rgba(170,255,0,0.12)' : 'rgba(255,255,255,0.06)',
                            color:      row.isFeatured ? '#AAFF00' : 'rgba(255,255,255,0.35)',
                            opacity:    isFeaturing ? 0.5 : 1,
                          }}>
                          {isFeaturing ? '…' : row.isFeatured ? '★ Destacado' : '☆ Destacar'}
                        </button>
                      ) : (
                        <span className="text-[rgba(255,255,255,0.15)] text-[12px]">—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">

                        {/* Ver perfil */}
                        <button
                          type="button"
                          onClick={() => handleView(row)}
                          disabled={row.status !== 'published'}
                          title={row.status !== 'published' ? 'Solo disponible para perfiles publicados' : 'Ver perfil público'}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.45)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed">
                          Ver
                        </button>

                        {/* Aprobar / Rechazar — solo pendientes */}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              disabled={isApproving}
                              onClick={() => handleApprove(row)}
                              title="Aprobar perfil"
                              className="text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer bg-transparent disabled:opacity-50"
                              style={{ borderColor: 'rgba(0,200,83,0.3)', color: 'rgba(0,200,83,0.8)' }}>
                              {isApproving ? '…' : 'Aprobar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectTarget({ uid: row.uid, col: row.col, displayName: row.displayName })}
                              title="Rechazar perfil"
                              className="text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer bg-transparent"
                              style={{ borderColor: 'rgba(255,60,60,0.3)', color: 'rgba(255,100,100,0.8)' }}>
                              Rechazar
                            </button>
                          </>
                        )}

                        {/* Ocultar / Publicar */}
                        {canToggle && (
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggle(row)}
                            title={row.status === 'published' ? 'Ocultar perfil' : 'Publicar perfil'}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer bg-transparent disabled:opacity-50"
                            style={row.status === 'published'
                              ? { borderColor: 'rgba(255,180,0,0.25)', color: 'rgba(255,180,0,0.7)' }
                              : { borderColor: 'rgba(0,200,83,0.25)',  color: 'rgba(0,200,83,0.7)' }
                            }>
                            {isToggling ? '…' : row.status === 'published' ? 'Ocultar' : 'Publicar'}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[rgba(255,255,255,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
            </div>
            <p className="text-[rgba(255,255,255,0.25)] text-sm">Sin resultados para los filtros actuales.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[12px] text-[rgba(170,255,0,0.6)] underline cursor-pointer bg-transparent border-none hover:text-[#AAFF00] transition-colors">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[rgba(255,255,255,0.3)] text-[12px]">
            {filtered.length} resultados · Página {safePage} de {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.45)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed text-[12px]">
              ← Anterior
            </button>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.45)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed text-[12px]">
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <RejectModal
        open={rejectTarget !== null}
        profileName={rejectTarget?.displayName ?? ''}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}
