'use client'
import type { PendingItem } from '@/app/admin/page'

interface Props {
  items: PendingItem[]
  onApprove: (item: PendingItem) => void
  onReject: (item: PendingItem) => void
  compact?: boolean
}

const COL_LABEL: Record<string, string> = { players:'Jugador', coaches:'Técnico', clubs:'Club', agents:'Representante' }

const TYPE_COLOR: Record<string, string> = {
  players: 'rgba(170,255,0,0.1)',
  coaches: 'rgba(34,211,238,0.1)',
  clubs:   'rgba(59,130,246,0.1)',
  agents:  'rgba(123,63,246,0.1)',
}
const TYPE_TEXT: Record<string, string> = {
  players: '#AAFF00',
  coaches: '#22D3EE',
  clubs:   '#3B82F6',
  agents:  '#7B3FF6',
}

function Avatar({ text }: { text: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF00] to-[#7B3FF6] flex items-center justify-center text-[10px] font-black text-black shrink-0">
      {text}
    </div>
  )
}

const TABS = ['Todos','Jugadores','Técnicos','Clubes','Representantes']

export default function AdminPendingTable({ items, onApprove, onReject, compact }: Props) {
  const label = (item: PendingItem) => COL_LABEL[item._col] ?? item._col
  const initials = (item: PendingItem) => {
    const name: string = item.fullName ?? item.name ?? '??'
    return name.split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase()
  }

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-white">Perfiles pendientes de revisión</h2>
        {compact && (
          <span className="text-[12px] font-bold text-[#AAFF00] cursor-pointer hover:underline">Ver todos</span>
        )}
        {!compact && (
          <button className="text-[12px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer bg-transparent">
            Exportar
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-6 mb-5 border-b border-[rgba(255,255,255,0.07)] text-sm">
        {TABS.map((t, i) => (
          <button key={t}
            className="pb-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-none -mb-px"
            style={{ color: i === 0 ? '#AAFF00' : 'rgba(255,255,255,0.35)', borderBottomColor: i === 0 ? '#AAFF00' : 'transparent' }}>
            {t} {i === 0 ? `(${items.length})` : ''}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="py-14 text-center text-[rgba(255,255,255,0.2)] text-sm">
          ✓ No hay perfiles pendientes de revisión
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.07)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.03)]">
                  {['', 'Perfil', 'Tipo', 'Edad', 'País', 'Registro', 'Motivo', 'Acciones'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.25)] border-b border-[rgba(255,255,255,0.07)]">
                      {h === '' ? (
                        <span className="block w-4 h-4 rounded border border-[rgba(255,255,255,0.15)]" />
                      ) : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`${item._col}-${item.uid ?? idx}`} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-4 py-3">
                      <span className="block w-4 h-4 rounded border border-[rgba(255,255,255,0.15)]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar text={initials(item)} />
                        <span className="text-white font-medium">{item.fullName ?? item.name ?? 'Sin nombre'}</span>
                        {item.isMinor && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)] font-bold">MENOR</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                        style={{ background: TYPE_COLOR[item._col] ?? 'rgba(255,255,255,0.06)', color: TYPE_TEXT[item._col] ?? 'rgba(255,255,255,0.4)' }}>
                        {label(item)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.45)]">{item.age ?? item.birthYear ?? '—'}</td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.45)]">{item.nationality ?? item.country ?? '—'}</td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.3)] text-[12px]">
                      {item.createdAt ? new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.35)] text-[12px]">
                      {item.isMinor ? 'Menor de edad' : item.status === 'pending' ? 'Documentación pendiente' : 'Revisión manual'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onApprove(item)}
                          className="text-[11px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all"
                          style={{ background: 'rgba(170,255,0,0.12)', color: '#AAFF00' }}>
                          Aprobar
                        </button>
                        <button onClick={() => onReject(item)}
                          className="text-[11px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all"
                          style={{ background: 'rgba(244,63,94,0.10)', color: '#F43F5E' }}>
                          Rechazar
                        </button>
                        <button className="p-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.35)] hover:text-white transition-colors cursor-pointer bg-transparent">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!compact && (
            <div className="mt-5 flex items-center justify-center gap-1.5 text-sm">
              <button className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.25)] hover:text-white transition-colors cursor-pointer bg-transparent text-[12px]">← Anterior</button>
              {[1,2,3,4].map(n => (
                <button key={n} className="w-9 h-9 rounded-lg text-[12px] font-semibold cursor-pointer border-none transition-all"
                  style={{ background: n===1 ? '#AAFF00' : 'transparent', color: n===1 ? '#000' : 'rgba(255,255,255,0.4)' }}>
                  {n}
                </button>
              ))}
              <span className="text-[rgba(255,255,255,0.2)] px-2">…</span>
              <button className="w-9 h-9 rounded-lg text-[12px] text-[rgba(255,255,255,0.4)] hover:text-white cursor-pointer bg-transparent border-none">10</button>
              <button className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.45)] hover:text-white transition-colors cursor-pointer bg-transparent text-[12px]">Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
