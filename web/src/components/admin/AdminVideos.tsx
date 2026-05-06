'use client'
import type { VideoEntry } from '@/types'

interface Props {
  videos: (VideoEntry & { playerUid: string })[]
  onToggle: (v: VideoEntry & { playerUid: string }) => void
  onRemove: (playerUid: string, id: string) => void
  compact?: boolean
}

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

export default function AdminVideos({ videos, onToggle, onRemove, compact }: Props) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-white">Videos pendientes de revisión</h2>
        {compact
          ? <button className="text-[12px] font-bold text-[#AAFF00] cursor-pointer hover:underline bg-transparent border-none">Ver todos</button>
          : <div className="flex gap-2">
              <button className="text-[11px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer bg-transparent">Filtrar ▾</button>
            </div>
        }
      </div>

      {videos.length === 0 ? (
        <div className="py-12 text-center text-[rgba(255,255,255,0.2)] text-sm">No hay videos subidos.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {videos.map(v => (
            <div key={`${v.playerUid}-${v.id}`}
              className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3 hover:border-[rgba(255,255,255,0.11)] transition-colors">
              <VideoThumb />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{v.title ?? 'Sin título'}</p>
                <p className="text-[11px] text-[rgba(255,255,255,0.35)] truncate mt-0.5">{v.playerUid}</p>
                {!compact && v.url && (
                  <p className="text-[10px] text-[rgba(255,255,255,0.2)] truncate mt-0.5">{v.url}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onToggle(v)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all"
                  style={{
                    background: v.status === 'active' ? 'rgba(170,255,0,0.1)' : 'rgba(255,255,255,0.06)',
                    color: v.status === 'active' ? '#AAFF00' : 'rgba(255,255,255,0.3)',
                  }}>
                  {v.status === 'active' ? 'Visible' : 'Oculto'}
                </button>
                <button onClick={() => onRemove(v.playerUid, v.id)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all"
                  style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E' }}>
                  Eliminar
                </button>
                {/* 3-dot menu */}
                <button className="p-1.5 rounded-lg text-[rgba(255,255,255,0.25)] hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5"  r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
