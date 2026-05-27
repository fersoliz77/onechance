'use client'
import { type CSSProperties, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ContactModal from '@/components/ui/ContactModal'
import ProfileSkeleton from '@/components/ui/ProfileSkeleton'
import { getAgent } from '@/lib/firestore'
import { getPhotos, getProfileState, getVideos, subscribeProfileVisits, type PhotoEntry } from '@/lib/rtdb'
import { useAuth } from '@/context/AuthContext'
import { canViewProfile } from '@/lib/publicProfileAccess'
import { registerProfileVisit } from '@/lib/profileViews'
import type { AgentProfile, VideoEntry } from '@/types'
import VideoCard from '@/components/ui/VideoCard'

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [showContactCta, setShowContactCta] = useState(false)
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [visits, setVisits] = useState(0)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    let active = true
    ;(async () => {
      const [aRes, sRes, vRes, pRes] = await Promise.allSettled([getAgent(id), getProfileState(id), getVideos(id), getPhotos(id)])
      if (!active) return

      setAgent(aRes.status === 'fulfilled' ? aRes.value : null)
      setShowContactCta(sRes.status === 'fulfilled' ? Boolean(sRes.value?.visibility?.showContact) : false)
      setVideos(vRes.status === 'fulfilled' ? vRes.value.filter((entry) => entry.status === 'published') : [])
      setPhotos(pRes.status === 'fulfilled' ? pRes.value.filter((entry) => entry.status === 'published').sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [])
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => subscribeProfileVisits(id, setVisits), [id])

  useEffect(() => {
    if (!agent) return
    const canView = canViewProfile({
      profileStatus: agent.status,
      profileUid: agent.uid,
      viewerUid: user?.uid,
      viewerSystemRole: user?.systemRole,
    })
    if (!canView) return
    registerProfileVisit(id, user?.uid)
  }, [id, agent, user?.systemRole, user?.uid])

  if (loading) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] oc-main-offset"><div className="oc-shell-content oc-page-block max-w-[1100px]"><ProfileSkeleton /></div></div></div>
  if (!agent) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.6)]">Representante no encontrado.</div></div>

  const canView = canViewProfile({
    profileStatus: agent.status,
    profileUid: agent.uid,
    viewerUid: user?.uid,
    viewerSystemRole: user?.systemRole,
  })
  if (!canView) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Este perfil no está disponible públicamente.</div></div>

  const accent = 'var(--oc-role-agent)'

  function handleContact() {
    if (user) setShowContact(true)
    else router.push('/auth?tab=register')
  }

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(180,100,255,0.11),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      {showContact && agent && (
        <ContactModal toUid={id} toName={agent.fullName} toRole="agent" accent={accent} onClose={() => setShowContact(false)} />
      )}
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <Button variant="ghost" onClick={() => router.push('/representantes')} className="mb-5 text-[12px]">← Volver al listado</Button>

          {/* Hero card */}
          <div className="oc-detail-hero mb-1" style={{ '--oc-accent': accent } as CSSProperties}>
            <div className="oc-detail-hero-accent" />
            <div className="grid md:grid-cols-[260px_1fr]">
              {/* Left panel */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center border-b border-white/10 px-6 py-7 md:border-b-0 md:border-r md:border-white/10"
                style={{ background: 'linear-gradient(160deg,color-mix(in srgb,var(--oc-accent) 18%, transparent),rgba(0,0,0,0))' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] opacity-[0.07]">
                  <svg viewBox="0 0 100 110" fill="var(--oc-accent)"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
                </div>
                <div
                  className="w-[96px] h-[96px] rounded-full flex items-center justify-center text-[41px] border-[2.5px] z-10 mb-3.5 animate-float"
                  style={{ background: 'linear-gradient(135deg,var(--oc-accent),#2A0A4A)', borderColor: 'color-mix(in srgb, var(--oc-accent) 42%, transparent)', boxShadow: '0 0 32px color-mix(in srgb, var(--oc-accent) 24%, transparent)' }}
                >
                  🤝
                </div>
                <div className="text-white text-[16px] font-medium text-center z-10 leading-[1.2]">{agent.fullName}</div>
                <div className="z-10 mt-1 text-center text-[12px] text-[color-mix(in_srgb,var(--oc-accent)_72%,white)]">{agent.agencyName || 'Representante independiente'}</div>
                <div className="mt-4 z-10 flex gap-2">
                  {agent.players > 0 && (
                    <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--oc-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_10%,transparent)] px-3 py-2 text-center">
                      <div className="text-[23px] font-medium leading-none text-[var(--oc-accent)]">{agent.players}</div>
                      <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.06em] mt-0.5">Jugadores</div>
                    </div>
                  )}
                  {agent.countries > 0 && (
                    <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--oc-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_10%,transparent)] px-3 py-2 text-center">
                      <div className="text-[23px] font-medium leading-none text-[var(--oc-accent)]">{agent.countries}</div>
                      <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.06em] mt-0.5">Países</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Right panel */}
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge status={agent.status} />
                  <span className="text-[rgba(255,255,255,0.25)] text-[12px]">{agent.nationality}</span>
                </div>
                <h1 className="text-[31px] leading-[1.03] font-semibold tracking-[-0.04em] text-white">Perfil de representante</h1>
                <p className="mt-2 text-[14px] leading-[1.65] text-[var(--oc-text-muted)]">Información comercial, mercados activos y estructura de representación deportiva.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                  {[
                    ['Jugadores', agent.players > 0 ? String(agent.players) : '—'],
                    ['Países', agent.countries > 0 ? String(agent.countries) : '—'],
                    ['Agencia', agent.agencyName || 'Independiente'],
                    ['Visitas', visits.toLocaleString('es-AR')],
                  ].map(([l,v]) => (
                    <div key={l} className="rounded-[9px] border border-[color-mix(in_srgb,var(--oc-accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_8%,transparent)] p-[10px_12px] text-center">
                      <div className="truncate text-[14px] font-medium leading-none text-[var(--oc-accent)]">{v}</div>
                      <div className="text-[rgba(255,255,255,0.25)] text-[10px] mt-[3px] uppercase tracking-[0.05em]">{l}</div>
                    </div>
                  ))}
                </div>
                {agent.markets && agent.markets.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-2">Mercados</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {agent.markets.map(m => (
                        <span key={m} className="oc-role-chip px-[11px] py-1 text-[11px]" style={{ '--oc-accent': accent } as CSSProperties}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                {agent.career && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-[6px] w-[6px] rounded-full bg-[var(--oc-accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--oc-accent)_60%,transparent)]" />
                    <span className="text-[rgba(255,255,255,0.5)] text-[13px]">{agent.career}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav className="mb-5 grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[13px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-7">
            {['Resumen', 'Agencia', 'Mercados', 'Transfers', 'Videos', 'Fotos', 'Contacto'].map((tab, i) => (
              <button key={tab} type="button" onClick={() => setActiveTab(i)} className={`flex items-center justify-center border-b-2 cursor-pointer bg-transparent transition-colors ${activeTab === i ? 'border-[var(--oc-purple)] text-[var(--oc-purple)]' : 'border-transparent hover:text-white'}`}>{tab}</button>
            ))}
          </nav>

          {/* Two-col */}
          <div className="grid gap-[var(--oc-space-4)] lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-3.5">
              {(activeTab === 0 || activeTab === 1) && agent.bio && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Sobre el representante</div>
                  <p className="text-[rgba(255,255,255,0.5)] text-[13px] leading-[1.8]">{agent.bio}</p>
                </div>
              )}
              {(activeTab === 0 || activeTab === 3) && agent.notableTransfers && agent.notableTransfers.length > 0 && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Transfers destacados</div>
                  <div className="flex flex-col gap-1.5">
                    {agent.notableTransfers.map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`h-[7px] w-[7px] shrink-0 rounded-full ${i === 0 ? 'bg-[var(--oc-accent)]' : 'bg-white/15'}`} />
                        <span className="text-[rgba(255,255,255,0.5)] text-[13px]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(activeTab === 0 || activeTab === 4) && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Videos de jugadores representados</div>
                  {videos.length === 0 ? (
                    <p className="text-[13px] text-[rgba(255,255,255,0.35)]">Este representante aún no publicó videos.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(activeTab === 0 || activeTab === 5) && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Fotos</div>
                  {photos.length === 0 ? (
                    <p className="text-[13px] text-[rgba(255,255,255,0.35)]">Este representante aún no publicó fotos.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {photos.slice(0, 9).map((photo, i) => (
                        <div key={photo.id} className="relative aspect-square overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.08)]">
                          <Image src={photo.url} alt={`Foto ${i + 1} de ${agent.fullName}`} fill sizes="180px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {(activeTab === 0 || activeTab === 1 || activeTab === 2 || activeTab === 6) && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-4)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2">Agencia</div>
                  <div className="text-white text-[15px] font-medium">{agent.agencyName || 'Independiente'}</div>
                  <div className="text-[rgba(255,255,255,0.3)] text-[12px] mt-1">{agent.nationality}</div>
                </div>
              )}
              <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--oc-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_8%,transparent)] p-4">
                <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2">Contacto</div>
                <p className="text-[rgba(255,255,255,0.35)] text-[12px] leading-[1.6] mb-3">
                  {user ? 'Enviá un mensaje directo a este representante.' : 'Para contactar a este representante, iniciá sesión o registrate.'}
                </p>
                {showContactCta ? (
                  <Button variant="primary" size="sm" className="w-full justify-center" onClick={handleContact}>Contactar</Button>
                ) : (
                  <div className="text-[12px] text-[rgba(255,255,255,0.22)]">El contacto directo está desactivado por este perfil.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
