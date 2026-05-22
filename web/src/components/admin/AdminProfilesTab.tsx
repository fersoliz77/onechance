'use client'
import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ROLE_ACCENT, ROLE_LABELS, ROLE_ROUTE, ROLE_COLLECTION } from '@/lib/constants'
import { STATUS_META } from '@/types'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, ProfileStatus, Role } from '@/types'
import AdminProfileDrawer from './AdminProfileDrawer'

// ── Unified row type ───────────────────────────────────────────────────────────

export type ProfileRow = {
  uid: string
  displayName: string
  role: Role
  col: string
  status: ProfileStatus
  subtitle: string
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

type AnyProfile = PlayerProfile | CoachProfile | ClubProfile | AgentProfile

interface Props {
  players:        PlayerProfile[]
  coaches:        CoachProfile[]
  clubs:          ClubProfile[]
  agents:         AgentProfile[]
  onChangeStatus: (uid: string, col: string, newStatus: ProfileStatus) => Promise<void>
  onFeatured:     (uid: string, current: boolean) => Promise<void>
  onRequestReject:(uid: string, col: string, name: string) => void
  onRefresh?:     () => void
}

// ── Tooltip (portal-based — escapes overflow:hidden parents) ──────────────────

function Tip({ children, label, side = 'top' }: { children: ReactNode; label: string; side?: 'top' | 'bottom' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos(side === 'top'
      ? { x: r.left + r.width / 2, y: r.top - 6 }
      : { x: r.left + r.width / 2, y: r.bottom + 6 }
    )
  }

  const tip = pos && mounted ? createPortal(
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: side === 'top' ? pos.y : pos.y,
        transform: side === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="px-2.5 py-1.5 rounded-lg bg-[rgba(8,8,8,0.97)] border border-[rgba(255,255,255,0.14)] text-[11px] font-medium text-white whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
    >
      {label}
    </div>,
    document.body,
  ) : null

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
        {children}
      </div>
      {tip}
    </>
  )
}

// ── Icon action button ─────────────────────────────────────────────────────────

interface ActionBtnProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  tooltip: string
  variant?: 'default' | 'green' | 'amber' | 'red' | 'lime' | 'lime-active'
  children: ReactNode
  side?: 'top' | 'bottom'
}

function ActionBtn({ onClick, disabled, loading, tooltip, variant = 'default', children, side }: ActionBtnProps) {
  const styles: Record<string, string> = {
    default:      'text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]',
    green:        'text-[rgba(0,200,83,0.7)] hover:text-[#00C853] hover:bg-[rgba(0,200,83,0.08)] border-[rgba(0,200,83,0.2)] hover:border-[rgba(0,200,83,0.35)]',
    amber:        'text-[rgba(255,180,0,0.7)] hover:text-[#FFB400] hover:bg-[rgba(255,180,0,0.08)] border-[rgba(255,180,0,0.2)] hover:border-[rgba(255,180,0,0.35)]',
    red:          'text-[rgba(255,80,80,0.7)] hover:text-[#F43F5E] hover:bg-[rgba(244,63,94,0.08)] border-[rgba(244,63,94,0.2)] hover:border-[rgba(244,63,94,0.35)]',
    'lime':       'text-[rgba(170,255,0,0.35)] hover:text-[#AAFF00] hover:bg-[rgba(170,255,0,0.06)] border-[rgba(170,255,0,0.12)] hover:border-[rgba(170,255,0,0.3)]',
    'lime-active':'text-[#AAFF00] bg-[rgba(170,255,0,0.1)] border-[rgba(170,255,0,0.3)] hover:bg-[rgba(170,255,0,0.16)]',
  }

  return (
    <Tip label={tooltip} side={side}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${styles[variant]}`}
      >
        {loading
          ? <span className="w-3 h-3 rounded-full border-[1.5px] border-t-transparent border-current animate-spin" />
          : children
        }
      </button>
    </Tip>
  )
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
  const color = ROLE_ACCENT[role]
  const label = ROLE_LABELS[role]
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}18` }}>
      {label}
    </span>
  )
}

const STATUS_ORDER: ProfileStatus[] = ['published', 'pending', 'hidden', 'rejected', 'draft']

interface StatusDropdownProps {
  row:             ProfileRow
  onChangeStatus:  (newStatus: ProfileStatus) => Promise<void>
  onRequestReject: () => void
}

function StatusDropdown({ row, onChangeStatus, onRequestReject }: StatusDropdownProps) {
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const triggerRef              = useRef<HTMLButtonElement>(null)
  const menuRef                 = useRef<HTMLDivElement>(null)
  const [pos, setPos]           = useState<{ x: number; y: number } | null>(null)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: r.left, y: r.bottom + 6 })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      if (menuRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const id = setTimeout(() => {
      document.addEventListener('mousedown', close)
      document.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleSelect = async (newStatus: ProfileStatus) => {
    setOpen(false)
    if (newStatus === row.status) return
    if (newStatus === 'rejected') { onRequestReject(); return }
    setLoading(true)
    await onChangeStatus(newStatus)
    setLoading(false)
  }

  const m = STATUS_META[row.status]

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap cursor-pointer transition-all hover:brightness-125 disabled:opacity-50 bg-transparent"
        style={{ color: m.color, background: m.bg, borderColor: m.border }}
      >
        {loading
          ? <span className="w-1.5 h-1.5 rounded-full border border-t-transparent border-current animate-spin" />
          : <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
        }
        {m.label}
        <svg className="w-2.5 h-2.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {open && pos && mounted && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999, minWidth: 172 }}
          className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#111] shadow-[0_16px_48px_rgba(0,0,0,0.75)] py-1.5 overflow-hidden"
        >
          <p className="px-3.5 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.2)]">
            Cambiar estado
          </p>
          {STATUS_ORDER.map(s => {
            const sm       = STATUS_META[s]
            const isCurrent = s === row.status
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors cursor-pointer bg-transparent border-none hover:bg-[rgba(255,255,255,0.05)]"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sm.color }} />
                <span className="flex-1 text-[13px]" style={{ color: isCurrent ? 'white' : 'rgba(255,255,255,0.6)' }}>
                  {sm.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-[rgba(255,255,255,0.25)]">actual</span>
                )}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

const IconEye = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const IconPencil = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconStarOutline = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconStarFilled = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconEyeOff = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const IconPublish = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const PAGE_SIZE = 25

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminProfilesTab({ players, coaches, clubs, agents, onChangeStatus, onFeatured, onRequestReject, onRefresh }: Props) {
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<Role | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'all'>('all')
  const [page,         setPage]         = useState(1)
  const [toggling,     setToggling]     = useState<string | null>(null)
  const [featuring,    setFeaturing]    = useState<string | null>(null)
  const [editing,      setEditing]      = useState<{ profile: AnyProfile; role: Role } | null>(null)

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
    const next: ProfileStatus = row.status === 'published' ? 'hidden' : 'published'
    setToggling(row.uid)
    await onChangeStatus(row.uid, row.col, next)
    setToggling(null)
  }

  const handleFeatured = async (row: ProfileRow) => {
    if (featuring || row.role !== 'player') return
    setFeaturing(row.uid)
    await onFeatured(row.uid, row.isFeatured)
    setFeaturing(null)
  }

  const handleView = (row: ProfileRow) => {
    window.open(`/${ROLE_ROUTE[row.role]}/${row.uid}`, '_blank')
  }

  const handleEdit = (row: ProfileRow) => {
    let profile: AnyProfile | undefined
    if      (row.role === 'player') profile = players.find(p => p.uid === row.uid)
    else if (row.role === 'coach')  profile = coaches.find(c => c.uid === row.uid)
    else if (row.role === 'club')   profile = clubs.find(c => c.uid === row.uid)
    else if (row.role === 'agent')  profile = agents.find(a => a.uid === row.uid)
    if (profile) setEditing({ profile, role: row.role })
  }

  const resetFilters = () => {
    setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1)
  }

  const statusPills: { key: ProfileStatus; label: string; count: number; color: string }[] = [
    { key: 'published', label: 'Publicados', count: counts.published, color: '#00C853' },
    { key: 'pending',   label: 'Pendientes', count: counts.pending,   color: '#FFB400' },
    { key: 'hidden',    label: 'Ocultos',    count: counts.hidden,    color: 'rgba(255,255,255,0.35)' },
    { key: 'rejected',  label: 'Rechazados', count: counts.rejected,  color: '#FF3C3C' },
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
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Perfil', 'Rol', 'Info', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgba(255,255,255,0.28)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => {
                const accent       = ROLE_ACCENT[row.role]
                const isToggling   = toggling  === row.uid
                const isFeaturing  = featuring === row.uid
                const canToggle    = row.status === 'published' || row.status === 'hidden'
                const isPlayer     = row.role === 'player'
                const isPublished  = row.status === 'published'
                const isHidden     = row.status === 'hidden'

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

                    {/* Info */}
                    <td className="px-5 py-3 text-[rgba(255,255,255,0.45)] text-[12px]">
                      {row.subtitle || '—'}
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-3">
                      <StatusDropdown
                        row={row}
                        onChangeStatus={ns => onChangeStatus(row.uid, row.col, ns)}
                        onRequestReject={() => onRequestReject(row.uid, row.col, row.displayName)}
                      />
                    </td>

                    {/* Acciones — 4 icon buttons */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">

                        {/* Ver perfil público */}
                        <ActionBtn
                          onClick={() => handleView(row)}
                          disabled={!isPublished}
                          tooltip={isPublished ? 'Ver perfil público' : 'Solo disponible para perfiles publicados'}
                          variant="default"
                        >
                          <IconEye />
                        </ActionBtn>

                        {/* Editar datos */}
                        <ActionBtn
                          onClick={() => handleEdit(row)}
                          tooltip="Editar datos del perfil"
                          variant="default"
                        >
                          <IconPencil />
                        </ActionBtn>

                        {/* Destacar — solo jugadores */}
                        <ActionBtn
                          onClick={() => handleFeatured(row)}
                          disabled={!isPlayer}
                          loading={isFeaturing}
                          tooltip={
                            !isPlayer
                              ? 'Solo disponible para jugadores'
                              : row.isFeatured
                                ? 'Quitar de destacados'
                                : 'Marcar como destacado'
                          }
                          variant={row.isFeatured ? 'lime-active' : 'lime'}
                        >
                          {row.isFeatured ? <IconStarFilled /> : <IconStarOutline />}
                        </ActionBtn>

                        {/* Ocultar / Publicar */}
                        {canToggle ? (
                          <ActionBtn
                            onClick={() => handleToggle(row)}
                            loading={isToggling}
                            tooltip={
                              isPublished
                                ? 'Ocultar perfil — dejará de ser visible en el sitio'
                                : 'Publicar perfil — volverá a ser visible en el sitio'
                            }
                            variant={isHidden ? 'green' : 'amber'}
                          >
                            {isHidden ? <IconPublish /> : <IconEyeOff />}
                          </ActionBtn>
                        ) : (
                          <Tip label={`No se puede cambiar visibilidad en estado "${STATUS_META[row.status].label}"`}>
                            <div className="w-7 h-7 rounded-md flex items-center justify-center border border-[rgba(255,255,255,0.05)] opacity-20 cursor-not-allowed">
                              <IconEyeOff />
                            </div>
                          </Tip>
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

      {/* Edit drawer */}
      <AdminProfileDrawer
        profile={editing?.profile ?? null}
        role={editing?.role ?? null}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); onRefresh?.() }}
      />

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

    </div>
  )
}
