'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { PhotoEntry } from '@/lib/rtdb'

interface Props {
  photos: (PhotoEntry & { playerUid: string })[]
  playerNames?: Record<string, string>
  onToggle: (p: PhotoEntry & { playerUid: string }) => void
  onRemove: (playerUid: string, id: string) => void
}

type StatusFilter = 'all' | 'published' | 'pending' | 'hidden'

export default function AdminPhotos({ photos, playerNames, onToggle, onRemove }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const display = statusFilter === 'all' ? photos : photos.filter((p) => p.status === statusFilter)

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-white">Moderación de fotos</h2>
        <div className="relative">
          <button onClick={() => setFilterOpen(o => !o)} className="text-[12px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:text-white cursor-pointer bg-transparent">
            Filtrar {statusFilter !== 'all' ? `· ${statusFilter === 'published' ? 'Publicadas' : statusFilter === 'pending' ? 'Pendientes' : 'Ocultas'}` : '▾'}
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-9 z-20 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111] shadow-xl py-1.5 min-w-[140px]">
              {(['all', 'published', 'pending', 'hidden'] as StatusFilter[]).map(f => (
                <button key={f} onClick={() => { setStatusFilter(f); setFilterOpen(false) }} className="w-full text-left px-4 py-2 text-[13px] cursor-pointer border-none hover:bg-[rgba(255,255,255,0.05)]" style={{ color: statusFilter === f ? '#AAFF00' : 'rgba(255,255,255,0.55)', background: 'transparent' }}>
                  {f === 'all' ? 'Todas' : f === 'published' ? 'Publicadas' : f === 'pending' ? 'Pendientes' : 'Ocultas'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {display.length === 0 ? (
        <div className="py-12 text-center text-[rgba(255,255,255,0.25)] text-sm">No hay fotos en esta categoría.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {display.map((p) => {
            const owner = playerNames?.[p.playerUid] ?? p.playerUid
            return (
              <div key={`${p.playerUid}-${p.id}`} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2">
                <div className="relative aspect-square overflow-hidden rounded-md border border-[rgba(255,255,255,0.08)]">
                  <Image src={p.url} alt="Foto de perfil" fill sizes="220px" className="object-cover" />
                </div>
                <div className="mt-2 text-[11px] text-[rgba(255,255,255,0.4)] truncate">{owner}</div>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => onToggle(p)} className="flex-1 text-[11px] px-2 py-1 rounded-md border-none cursor-pointer" style={{ background: p.status === 'published' ? 'rgba(0,200,83,0.14)' : p.status === 'pending' ? 'rgba(255,180,0,0.14)' : 'rgba(255,255,255,0.08)', color: p.status === 'published' ? '#00C853' : p.status === 'pending' ? '#FFB400' : 'rgba(255,255,255,0.7)' }}>
                    {p.status === 'pending' ? 'Aprobar' : p.status === 'published' ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button onClick={() => onRemove(p.playerUid, p.id)} className="text-[11px] px-2 py-1 rounded-md border-none cursor-pointer bg-[rgba(255,60,60,0.14)] text-[#ff7b7b]">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
