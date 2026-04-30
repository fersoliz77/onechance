'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { getPendingProfiles, setProfileStatus, setFeatured, getAllPlayers } from '@/lib/firestore'
import { getAllVideos, adminRemoveVideo, adminToggleVideo } from '@/lib/rtdb'
import type { PlayerProfile, VideoEntry, ProfileStatus } from '@/types'
import { STATUS_META } from '@/types'
import { type DocumentData } from 'firebase/firestore'

type PendingItem = DocumentData & { _col: string }

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 text-center">
      <div className="text-[24px] font-medium" style={{ color }}>{value}</div>
      <div className="text-[rgba(255,255,255,0.25)] text-[9px] uppercase tracking-[0.06em] mt-1">{label}</div>
    </div>
  )
}

function PendingCard({ item, onApprove, onReject }: { item: PendingItem; onApprove: () => void; onReject: () => void }) {
  const colLabel: Record<string, string> = { players:'Jugador', coaches:'Técnico', clubs:'Club', agents:'Representante' }
  const name = item.fullName ?? item.name ?? 'Sin nombre'
  return (
    <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3">
      <div>
        <div className="text-white text-[13px] font-medium">{name}</div>
        <div className="text-[rgba(255,255,255,0.3)] text-[10px]">{colLabel[item._col] ?? item._col} · {item.nationality ?? item.country ?? ''}</div>
      </div>
      <div className="ml-auto flex gap-2">
        <button onClick={onApprove}
          className="text-[10px] px-3 py-1.5 rounded-[7px] cursor-pointer font-sans border-none"
          style={{ background: 'rgba(0,200,83,0.12)', color: '#00C853' }}>
          Aprobar
        </button>
        <button onClick={onReject}
          className="text-[10px] px-3 py-1.5 rounded-[7px] cursor-pointer font-sans border-none"
          style={{ background: 'rgba(255,60,60,0.1)', color: '#FF6060' }}>
          Rechazar
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'pending' | 'players' | 'videos'>('pending')
  const [pending, setPending] = useState<PendingItem[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [videos, setVideos] = useState<(VideoEntry & { playerUid: string })[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.email?.includes('admin') ?? false

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/')
  }, [user, authLoading, isAdmin, router])

  useEffect(() => {
    if (!user || !isAdmin) return
    Promise.all([getPendingProfiles(), getAllPlayers(), getAllVideos()]).then(([p, pl, v]) => {
      setPending(p); setPlayers(pl); setVideos(v); setLoading(false)
    })
  }, [user, isAdmin])

  const handleStatus = async (item: PendingItem, status: ProfileStatus) => {
    await setProfileStatus(item._col, item.uid, status)
    setPending(ps => ps.filter(p => p.uid !== item.uid))
  }

  const handleFeatured = async (uid: string, current: boolean) => {
    await setFeatured(uid, !current)
    setPlayers(ps => ps.map(p => p.uid === uid ? { ...p, isFeatured: !current } : p))
  }

  const handleRemoveVideo = async (playerUid: string, id: string) => {
    await adminRemoveVideo(playerUid, id)
    setVideos(vs => vs.filter(v => !(v.playerUid === playerUid && v.id === id)))
  }

  const handleToggleVideo = async (v: VideoEntry & { playerUid: string }) => {
    const next = v.status === 'active' ? 'hidden' : 'active'
    await adminToggleVideo(v.playerUid, v.id, next)
    setVideos(vs => vs.map(x => x.id === v.id && x.playerUid === v.playerUid ? { ...x, status: next } : x))
  }

  if (authLoading || loading) {
    return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  }

  if (!user || !isAdmin) return null

  const publishedPlayers = players.filter(p => p.status === 'published')
  const featuredPlayers = players.filter(p => p.isFeatured)

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14">
        <div className="max-w-[960px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(255,60,60,0.08)] border border-[rgba(255,60,60,0.2)] rounded-[20px] px-3 py-1 mb-3">
              <div className="w-[5px] h-[5px] bg-[#FF3C3C] rounded-full animate-blink" />
              <span className="text-[#FF6060] text-[9px] tracking-[0.07em]">PANEL ADMINISTRADOR</span>
            </div>
            <h1 className="text-white text-[28px] font-medium tracking-[-0.03em]">Admin · OneChance</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <Stat label="Pendientes" value={pending.length} color="#FFB400" />
            <Stat label="Publicados" value={publishedPlayers.length} color="#00C853" />
            <Stat label="Destacados" value={featuredPlayers.length} color="#B464FF" />
            <Stat label="Videos" value={videos.length} color="#5A8FFF" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-1 mb-6 w-fit">
            {([['pending','Pendientes'],['players','Jugadores'],['videos','Videos']] as const).map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-[7px] text-[11px] font-medium cursor-pointer font-sans transition-all duration-200 border-none"
                style={{ background: tab === t ? '#FF6060' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                {l} {t === 'pending' && pending.length > 0 ? `(${pending.length})` : ''}
              </button>
            ))}
          </div>

          {/* Pending */}
          {tab === 'pending' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Perfiles pendientes de aprobación</div>
              {pending.length === 0 ? (
                <div className="text-center py-12 text-[rgba(255,255,255,0.2)] text-[13px]">No hay perfiles pendientes. ✓</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((item, i) => (
                    <PendingCard key={`${item._col}-${item.uid ?? i}`} item={item}
                      onApprove={() => handleStatus(item, 'published')}
                      onReject={() => handleStatus(item, 'rejected')} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All players */}
          {tab === 'players' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Todos los jugadores</div>
              {players.length === 0 ? (
                <div className="text-center py-12 text-[rgba(255,255,255,0.2)] text-[13px]">No hay jugadores registrados.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {players.map(p => (
                    <div key={p.uid} className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3">
                      <div className="flex-1">
                        <div className="text-white text-[13px] font-medium">{p.fullName}</div>
                        <div className="text-[rgba(255,255,255,0.3)] text-[10px]">{p.position} · {p.nationality}</div>
                      </div>
                      <Badge status={p.status} />
                      <div className="flex gap-2 ml-2">
                        <button onClick={() => handleFeatured(p.uid, p.isFeatured)}
                          className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none transition-all"
                          style={{ background: p.isFeatured ? 'rgba(180,100,255,0.2)' : 'rgba(255,255,255,0.05)', color: p.isFeatured ? '#B464FF' : 'rgba(255,255,255,0.3)' }}>
                          {p.isFeatured ? '★ Destacado' : '☆ Destacar'}
                        </button>
                        {p.status !== 'published' && (
                          <button onClick={() => setProfileStatus('players', p.uid, 'published').then(() => setPlayers(ps => ps.map(x => x.uid === p.uid ? {...x, status:'published'} : x)))}
                            className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none"
                            style={{ background: 'rgba(0,200,83,0.1)', color: '#00C853' }}>
                            Publicar
                          </button>
                        )}
                        {p.status === 'published' && (
                          <button onClick={() => setProfileStatus('players', p.uid, 'hidden').then(() => setPlayers(ps => ps.map(x => x.uid === p.uid ? {...x, status:'hidden'} : x)))}
                            className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                            Ocultar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Videos */}
          {tab === 'videos' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Todos los videos</div>
              {videos.length === 0 ? (
                <div className="text-center py-12 text-[rgba(255,255,255,0.2)] text-[13px]">No hay videos subidos.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {videos.map(v => (
                    <div key={`${v.playerUid}-${v.id}`} className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[12px] truncate">{v.title}</div>
                        <div className="text-[rgba(255,255,255,0.2)] text-[9px] truncate">{v.url ?? '—'}</div>
                        <div className="text-[rgba(255,255,255,0.15)] text-[9px]">Jugador: {v.playerUid}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleToggleVideo(v)}
                          className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none"
                          style={{ background: v.status === 'active' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)', color: v.status === 'active' ? '#00C853' : 'rgba(255,255,255,0.3)' }}>
                          {v.status === 'active' ? 'Visible' : 'Oculto'}
                        </button>
                        <button onClick={() => handleRemoveVideo(v.playerUid, v.id)}
                          className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none"
                          style={{ background: 'rgba(255,60,60,0.1)', color: '#FF6060' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
