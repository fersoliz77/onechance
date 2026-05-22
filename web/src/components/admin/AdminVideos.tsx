'use client'
import { useState } from 'react'
import type { VideoEntry } from '@/types'

interface Props {
  videos: (VideoEntry & { playerUid: string })[]
  playerNames?: Record<string, string>
  onToggle: (v: VideoEntry & { playerUid: string }) => void
  onRemove: (playerUid: string, id: string) => void
  onViewAll?: () => void
  compact?: boolean
}

type StatusFilter = 'all' | 'active' | 'hidden'

function VideoThumb() {
  return (
    <div className="relative w-24 h-14 shrink-0 rounded-lg overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#111,#1a2a1a 45%,#1a1a2a)' }}>
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 30% 35%,rgba(170,255,0,0.25),transparent 50%),radial-gradient(circle at 75% 40%,rgba(59,130,246,0.2),transparent 50%)' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.4)] flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
  )
}

export default function AdminVideos({ videos, playerNames, onToggle, onRemove, onViewAll, compact }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  const displayVideos = statusFilter === 'all' ? videos : videos.filter(v => v.status === statusFilter)

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-semibold text-white">Videos pendientes de revisión</h2>
        {compact
          ? onViewAll && <button onClick={onViewAll} className="text-[13px] font-bold text-[#AAFF00] cursor-pointer hover:underline bg-transparent border-none">Ver todos</button>
          : (
            <div className="relative flex gap-2">
              <button
                onClick={() => setFilterOpen(o => !o)}
                className="text-[12px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer bg-transparent flex items-center gap-1">
                Filtrar {statusFilter !== 'all' ? `· ${statusFilter === 'active' ? 'Visibles' : 'Ocultos'}` : '▾'}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-9 z-20 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111] shadow-xl py-1.5 min-w-[140px]">
                  {(['all', 'active', 'hidden'] as StatusFilter[]).map(f => (
                    <button key={f} onClick={() => { setStatusFilter(f); setFilterOpen(false) }}
                      className="w-full text-left px-4 py-2 text-[13px] cursor-pointer border-none transition-all hover:bg-[rgba(255,255,255,0.05)]"
                      style={{ color: statusFilter === f ? '#AAFF00' : 'rgba(255,255,255,0.55)', background: 'transparent' }}>
                      {f === 'all' ? 'Todos' : f === 'active' ? 'Visibles' : 'Ocultos'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        }
      </div>

      {displayVideos.length === 0 ? (
        <div className="py-12 text-center text-[rgba(255,255,255,0.2)] text-sm">No hay videos subidos.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {displayVideos.map(v => {
            const playerName = playerNames?.[v.playerUid]
            return (
              <div key={`${v.playerUid}-${v.id}`}
                className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3 hover:border-[rgba(255,255,255,0.11)] transition-colors">
                <VideoThumb />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white truncate">{v.title ?? 'Sin título'}</p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.35)] truncate mt-0.5">
                    {playerName ?? v.playerUid}
                  </p>
                  {!compact && v.url && (
                    <p className="text-[11px] text-[rgba(255,255,255,0.2)] truncate mt-0.5">{v.url}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onToggle(v)}
                    className="text-[12px] px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all"
                    style={{
                      background: v.status === 'active' ? 'rgba(170,255,0,0.1)' : 'rgba(255,255,255,0.06)',
                      color: v.status === 'active' ? '#AAFF00' : 'rgba(255,255,255,0.3)',
                    }}>
                    {v.status === 'active' ? 'Visible' : 'Oculto'}
                  </button>
                  <button onClick={() => onRemove(v.playerUid, v.id)}
                    className="text-[12px] px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all"
                    style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
