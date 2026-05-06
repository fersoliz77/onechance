'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPlayer } from '@/lib/firestore'
import { getVideos } from '@/lib/rtdb'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import ContactModal from '@/components/ui/ContactModal'
import type { PlayerProfile, VideoEntry } from '@/types'

function computeAge(iso: string): string {
  if (!iso) return 'N/D'
  const born = new Date(iso)
  if (isNaN(born.getTime())) return 'N/D'
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--
  return String(age)
}

const accent = '#00C853'

function StatBar({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] pb-2 text-[13px]">
      <span className="text-[rgba(255,255,255,0.45)]">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}

function VideoCard({ video }: { video: VideoEntry }) {
  const icon = video.platform === 'youtube' ? '▶' : video.platform === 'vimeo' ? '🎬' : video.platform === 'tiktok' ? '🎵' : video.platform === 'instagram' ? '📸' : '🔗'
  return (
    <a href={video.url ?? '#'} target="_blank" rel="noopener noreferrer"
      className="block overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(0,200,83,0.4)] transition-all group">
      <div className="aspect-video flex items-center justify-center bg-[rgba(0,0,0,0.3)] relative">
        <span className="text-[26px] opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
      </div>
      <div className="p-2.5">
        <p className="truncate text-[11px] font-medium text-white">{video.title}</p>
        <p className="mt-0.5 text-[10px] text-[rgba(255,255,255,0.35)] capitalize">{video.platform ?? 'Enlace'}</p>
      </div>
    </a>
  )
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      getPlayer(id),
      getVideos(id),
    ]).then(([p, v]) => {
      if (!active) return
      setPlayer(p)
      setVideos(v.filter(x => x.status === 'active'))
      setLoading(false)
    })
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando perfil…</div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-[2] pt-28 text-center">
          <div className="text-[rgba(255,255,255,0.3)] text-[14px] mb-4">Jugador no encontrado.</div>
          <Button variant="outline" size="sm" onClick={() => router.push('/jugadores')}>← Volver al listado</Button>
        </div>
      </div>
    )
  }

  const age = computeAge(player.birthDate)
  const isFemale = player.gender === 'F'
  const playerAccent = isFemale ? '#B464FF' : accent

  function handleContact() {
    if (user) setShowContact(true)
    else router.push('/auth?tab=register')
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      {showContact && player && (
        <ContactModal toUid={id} toName={player.fullName} accent={playerAccent} onClose={() => setShowContact(false)} />
      )}
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-detail oc-page-block">
          <Button variant="ghost" onClick={() => router.push('/jugadores')} className="mb-5 text-[11px]">← Volver al listado</Button>

          {/* Hero */}
          <div
            className="mb-4 overflow-hidden"
            style={{
              background: isFemale ? 'linear-gradient(135deg,#1A0A2E,#0B0518)' : 'linear-gradient(135deg,#0A1C10,#060E08)',
              border: `0.5px solid ${playerAccent}40`,
              borderRadius: '20px 4px 20px 20px',
              clipPath: 'polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%)',
            }}
          >
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg,${playerAccent},rgba(0,0,0,0))` }} />
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Left */}
              <div className="w-full md:w-[220px] shrink-0 p-8 flex flex-col items-center justify-center relative"
                style={{ background: `linear-gradient(160deg,${playerAccent}18,rgba(0,0,0,0))`, borderRight: `0.5px solid ${playerAccent}22` }}>
                <div
                  className="w-[96px] h-[96px] rounded-full flex items-center justify-center text-[42px] border-[2.5px] z-10 mb-3.5 animate-float"
                  style={{ background: `linear-gradient(135deg,${playerAccent},${isFemale ? '#3A1A5A' : '#003A18'})`, borderColor: `${playerAccent}66`, boxShadow: `0 0 32px ${playerAccent}30` }}
                >
                  {isFemale ? '👩' : '⚽'}
                </div>
                <div className="text-white text-[16px] font-medium text-center z-10 leading-[1.2]">{player.fullName}</div>
                <div className="text-[11px] mt-1 text-center z-10" style={{ color: `${playerAccent}BB` }}>{player.position}</div>

                {player.overall > 0 && (
                  <div className="mt-4 z-10 rounded-[10px] px-5 py-2 text-center" style={{ background: `${playerAccent}15`, border: `0.5px solid ${playerAccent}30` }}>
                    <div className="text-[28px] font-medium leading-none tracking-[-0.02em]" style={{ color: playerAccent }}>{player.overall}</div>
                    <div className="text-[rgba(255,255,255,0.2)] text-[8px] uppercase tracking-[0.06em] mt-0.5">Overall</div>
                  </div>
                )}
                {player.isFeatured && (
                  <div className="mt-2 z-10 text-[9px] font-medium px-2.5 py-1 rounded-[8px] tracking-[0.06em]"
                    style={{ background: `${playerAccent}20`, color: playerAccent, border: `0.5px solid ${playerAccent}40` }}>
                    ★ Destacado
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="flex-1 p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                  {[
                    ['Edad', age ? `${age} años` : '—'],
                    ['Nacionalidad', player.nationality || '—'],
                    ['Pie hábil', player.strongFoot || '—'],
                    ['Altura', player.height ? `${player.height} m` : '—'],
                    ['Peso', player.weight ? `${player.weight} kg` : '—'],
                    ['Club', player.currentClub || 'Libre'],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-[9px] p-[10px_12px]" style={{ background: `${playerAccent}08`, border: `0.5px solid ${playerAccent}20` }}>
                      <div className="text-[13px] font-medium leading-none truncate" style={{ color: playerAccent }}>{v}</div>
                      <div className="text-[rgba(255,255,255,0.25)] text-[9px] mt-[3px] uppercase tracking-[0.05em]">{l}</div>
                    </div>
                  ))}
                </div>

                {player.characteristics?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {player.characteristics.map(c => (
                      <span key={c} className="text-[10px] px-[11px] py-1 rounded-[20px]"
                        style={{ background: `${playerAccent}10`, border: `0.5px solid ${playerAccent}30`, color: playerAccent }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two-col body */}
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="flex flex-col gap-3.5">
              {/* Bio */}
              {player.bio && (
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-[18px_20px]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2.5">Sobre el jugador</div>
                  <p className="text-[rgba(255,255,255,0.5)] text-[13px] leading-[1.8]">{player.bio}</p>
                </div>
              )}

              {/* Trayectoria */}
              {player.career?.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-[18px_20px]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2.5">Trayectoria</div>
                  <div className="flex flex-col gap-2.5">
                    {player.career.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: i === 0 ? playerAccent : 'rgba(255,255,255,0.15)' }} />
                        <span className="text-[13px] flex-1" style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }}>{entry.club}</span>
                        <span className="text-[rgba(255,255,255,0.25)] text-[11px] italic">{entry.years}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-[18px_20px]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-3">Videos</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {videos.map(v => <VideoCard key={v.id} video={v} />)}
                  </div>
                </div>
              )}

              {/* Posición en cancha */}
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-[18px_20px]">
                <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-3">Posición en cancha</div>
                <div className="relative aspect-[1.7] rounded-[8px] border border-[rgba(0,200,83,0.15)] bg-[rgba(0,40,15,0.5)]">
                  <div className="absolute inset-2 border border-[rgba(255,255,255,0.06)] rounded" />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-8 border border-[rgba(255,255,255,0.06)]" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-8 border border-[rgba(255,255,255,0.06)]" />
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-[rgba(255,255,255,0.06)]" />
                  <div className="absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.06)]" />
                  <div className="absolute left-[58%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-black text-[11px] font-bold"
                    style={{ background: playerAccent, boxShadow: `0 0 20px ${playerAccent}80` }}>
                    ⚽
                  </div>
                </div>
                <div className="mt-3 text-white text-[13px] font-medium">{player.position || '—'}</div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-3">
              {/* Stats rápidas */}
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4">
                <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-3">Datos del perfil</div>
                <div className="flex flex-col gap-2">
                  <StatBar label="Posición" value={player.position || '—'} />
                  <StatBar label="Edad" value={age ? `${age} años` : '—'} />
                  <StatBar label="Nationalidad" value={player.nationality || '—'} />
                  <StatBar label="Pie hábil" value={player.strongFoot || '—'} />
                  {player.height && <StatBar label="Altura" value={`${player.height} m`} />}
                  {player.weight && <StatBar label="Peso" value={`${player.weight} kg`} />}
                </div>
              </div>

              {/* Contacto */}
              <div className="rounded-[12px] p-4" style={{ background: `${playerAccent}0A`, border: `0.5px solid ${playerAccent}25` }}>
                <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2">Contacto</div>
                <p className="text-[rgba(255,255,255,0.35)] text-[11px] leading-[1.6] mb-3">
                  {user ? 'Enviá un mensaje directo a este jugador.' : 'Para contactar a este jugador, iniciá sesión o registrate en One Chance.'}
                </p>
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={handleContact}>
                  Contactar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
