'use client'
import { useState, useMemo } from 'react'
import type { PendingItem } from '@/app/admin/page'
import { exportToCsv } from '@/lib/exportCsv'

interface Props {
  items: PendingItem[]
  onApprove: (item: PendingItem) => void
  onReject: (item: PendingItem) => void
  onView?: (item: PendingItem) => void
  onViewAll?: () => void
  compact?: boolean
  density?: 'comfortable' | 'compact'
}

const ITEMS_PER_PAGE = 20

const COL_MAP: Record<string, string> = { players:'Jugador', coaches:'Técnico', clubs:'Club', agents:'Representante' }
const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  players: { bg:'rgba(170,255,0,0.10)',  text:'#AAFF00' },
  coaches: { bg:'rgba(34,211,238,0.10)', text:'#22D3EE' },
  clubs:   { bg:'rgba(59,130,246,0.10)', text:'#3B82F6' },
  agents:  { bg:'rgba(123,63,246,0.10)', text:'#7B3FF6' },
}

const TABS = [
  { label: 'Todos',          col: null },
  { label: 'Jugadores',      col: 'players' },
  { label: 'Técnicos',       col: 'coaches' },
  { label: 'Clubes',         col: 'clubs' },
  { label: 'Representantes', col: 'agents' },
]

function Avatar({ text }: { text: string }) {
  return (
    <div className="rounded-full bg-gradient-to-br from-[#AAFF00] to-[#7B3FF6] flex items-center justify-center font-black text-black shrink-0"
      style={{ width:32, height:32, fontSize:10 }}>
      {text}
    </div>
  )
}

function initials(item: PendingItem) {
  const n: string = item.fullName ?? item.name ?? '??'
  return n.split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase()
}

function calcAge(item: PendingItem): string {
  const birthDate = item.birthDate as string | undefined
  if (birthDate) {
    const birth = new Date(birthDate)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return String(age)
  }
  const age = item.age as number | undefined
  const birthYear = item.birthYear as number | undefined
  if (age !== undefined) return String(age)
  if (birthYear !== undefined) return String(new Date().getFullYear() - birthYear)
  return '—'
}

export default function AdminPendingTable({ items, onApprove, onReject, onView, onViewAll, compact, density = 'comfortable' }: Props) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)

  const py = density === 'compact' ? '8px' : '12px'

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchTab = activeTab === null || item._col === activeTab
      const q = search.toLowerCase()
      const name = ((item.fullName ?? item.name ?? '') as string).toLowerCase()
      const matchSearch = !q || name.includes(q) || (item.nationality ?? '').toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [items, activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageItems  = compact ? filtered : filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  function handleExport() {
    exportToCsv('pendientes-onechance', filtered.map(p => ({
      Nombre:   p.fullName ?? p.name ?? '',
      Tipo:     COL_MAP[p._col] ?? p._col,
      Edad:     calcAge(p),
      País:     p.nationality ?? p.country ?? '',
      Registro: p.createdAt ? new Date((p.createdAt as { toDate?: () => Date } | string)?.toString?.() ?? String(p.createdAt)).toLocaleDateString('es-AR') : '',
      Motivo:   p.isMinor ? 'Menor de edad' : 'Revisión manual',
    })))
  }

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-[17px] font-semibold text-white">
          Perfiles pendientes de revisión
          {filtered.length > 0 && <span className="ml-2 text-[14px] text-[rgba(255,255,255,0.3)]">({filtered.length})</span>}
        </h2>
        <div className="flex items-center gap-2">
          {!compact && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 text-[13px] px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.45)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent"
              aria-label="Exportar como CSV">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v11"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>
              Exportar CSV
            </button>
          )}
          {compact && onViewAll && (
            <button onClick={onViewAll} className="text-[13px] font-bold text-[#AAFF00] cursor-pointer hover:underline bg-transparent border-none">Ver todos</button>
          )}
        </div>
      </div>

      {/* Search */}
      {!compact && (
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(255,255,255,0.25)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre o país…"
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-4 py-2.5 text-[14px] text-white placeholder:text-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(170,255,0,0.4)] focus:bg-[rgba(170,255,0,0.03)] transition-all"
            aria-label="Buscar perfiles pendientes"
          />
        </div>
      )}

      {/* Sub-tabs */}
      {!compact && (
        <div className="flex gap-1 mb-4 border-b border-[rgba(255,255,255,0.07)] overflow-x-auto pb-px">
          {TABS.map(t => {
            const count = t.col === null ? items.length : items.filter(i => i._col === t.col).length
            const active = activeTab === t.col
            return (
              <button key={t.label} onClick={() => { setActiveTab(t.col); setPage(1) }}
                className="pb-2.5 px-1 text-[14px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 -mb-px whitespace-nowrap mr-4"
                style={{ color: active ? '#AAFF00' : 'rgba(255,255,255,0.35)', borderBottomColor: active ? '#AAFF00' : 'transparent' }}>
                {t.label} <span className="ml-1 text-[12px] opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-14 text-center text-[rgba(255,255,255,0.2)] text-sm">
          {search ? `Sin resultados para "${search}"` : '✓ No hay perfiles pendientes'}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.07)]">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] min-w-[720px]">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.03)]">
                  {['','Perfil','Tipo','Edad','País','Registro','Motivo','Acciones'].map((h,i) => (
                    <th key={i} className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.25)] border-b border-[rgba(255,255,255,0.07)]"
                      style={{ padding: `10px ${i===0?'12px':'16px'}` }}>
                      {h === '' ? <span className="block w-4 h-4 rounded border border-[rgba(255,255,255,0.15)]"/> : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item, idx) => {
                  const tc = TYPE_COLOR[item._col] ?? { bg:'rgba(255,255,255,0.06)', text:'rgba(255,255,255,0.4)' }
                  return (
                    <tr key={`${item._col}-${item.uid??idx}`}
                      className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td style={{ padding:`${py} 12px` }}>
                        <span className="block w-4 h-4 rounded border border-[rgba(255,255,255,0.15)]"/>
                      </td>
                      <td style={{ padding:`${py} 16px` }}>
                        <div className="flex items-center gap-2.5">
                          <Avatar text={initials(item)}/>
                          <span className="text-white font-medium truncate max-w-[120px]">{item.fullName ?? item.name ?? 'Sin nombre'}</span>
                          {item.isMinor && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)] font-bold shrink-0">MENOR</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding:`${py} 16px` }}>
                        <span className="text-[12px] font-semibold px-2 py-1 rounded-full" style={{ background:tc.bg, color:tc.text }}>
                          {COL_MAP[item._col] ?? item._col}
                        </span>
                      </td>
                      <td style={{ padding:`${py} 16px` }} className="text-[rgba(255,255,255,0.45)]">{calcAge(item)}</td>
                      <td style={{ padding:`${py} 16px` }} className="text-[rgba(255,255,255,0.45)]">{String(item.nationality ?? item.country ?? '—')}</td>
                      <td style={{ padding:`${py} 16px` }} className="text-[rgba(255,255,255,0.3)] text-[13px]">
                        {item.createdAt ? new Date(String(item.createdAt)).toLocaleDateString('es-AR') : '—'}
                      </td>
                      <td style={{ padding:`${py} 16px` }} className="text-[rgba(255,255,255,0.35)] text-[13px]">
                        {item.isMinor ? 'Menor de edad' : 'Revisión manual'}
                      </td>
                      <td style={{ padding:`${py} 16px` }}>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => onApprove(item)}
                            className="text-[12px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all hover:opacity-80"
                            style={{ background:'rgba(170,255,0,0.12)', color:'#AAFF00' }}>
                            Aprobar
                          </button>
                          <button onClick={() => onReject(item)}
                            className="text-[12px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all hover:opacity-80"
                            style={{ background:'rgba(244,63,94,0.10)', color:'#F43F5E' }}>
                            Rechazar
                          </button>
                          {onView && (
                            <button onClick={() => onView(item)}
                              className="p-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:text-white transition-colors cursor-pointer bg-transparent"
                              aria-label="Ver perfil">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/></svg>
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
          </div>

          {!compact && totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-[12px] text-[rgba(255,255,255,0.3)]">
                {filtered.length} resultados · Página {safePage} de {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)] text-[13px] cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-[rgba(255,255,255,0.18)]">
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let n: number
                  if (totalPages <= 5) n = i + 1
                  else if (safePage <= 3) n = i + 1
                  else if (safePage >= totalPages - 2) n = totalPages - 4 + i
                  else n = safePage - 2 + i
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      className="w-9 h-9 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all"
                      style={{ background:n===safePage?'#AAFF00':'transparent', color:n===safePage?'#000':'rgba(255,255,255,0.4)' }}>
                      {n}
                    </button>
                  )
                })}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)] text-[13px] cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-[rgba(255,255,255,0.18)]">
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
