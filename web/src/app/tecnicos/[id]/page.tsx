'use client'
import { type CSSProperties, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ContactModal from '@/components/ui/ContactModal'
import ProfileSkeleton from '@/components/ui/ProfileSkeleton'
import { getCoach } from '@/lib/firestore'
import { getProfileState, getVideos } from '@/lib/rtdb'
import { useAuth } from '@/context/AuthContext'
import { canViewProfile } from '@/lib/publicProfileAccess'
import type { CoachProfile, VideoEntry } from '@/types'

export default function CoachProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [coach, setCoach] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [showContactCta, setShowContactCta] = useState(false)
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    let active = true
    ;(async () => {
      const [cRes, sRes, vRes] = await Promise.allSettled([getCoach(id), getProfileState(id), getVideos(id)])
      if (!active) return

      setCoach(cRes.status === 'fulfilled' ? cRes.value : null)
      setShowContactCta(sRes.status === 'fulfilled' ? Boolean(sRes.value?.visibility?.showContact) : false)
      setVideos(vRes.status === 'fulfilled' ? vRes.value.filter((entry) => entry.status === 'active') : [])
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [id])

  if (loading) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] oc-main-offset"><div className="oc-shell-content oc-page-block max-w-[1100px]"><ProfileSkeleton /></div></div></div>
  if (!coach) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.6)]">Técnico no encontrado.</div></div>

  const canView = canViewProfile({
    profileStatus: coach.status,
    profileUid: coach.uid,
    viewerUid: user?.uid,
    viewerSystemRole: user?.systemRole,
  })
  if (!canView) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Este perfil no está disponible públicamente.</div></div>

  const accent = 'var(--oc-role-coach)'

  function handleContact() {
    if (user) setShowContact(true)
    else router.push('/auth?tab=register')
  }

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(90,143,255,0.11),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      {showContact && coach && (
        <ContactModal toUid={id} toName={coach.fullName} accent={accent} onClose={() => setShowContact(false)} />
      )}
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <Button variant="ghost" onClick={() => router.push('/tecnicos')} className="mb-5 text-[12px]">← Volver al listado</Button>

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
                  className="w-[96px] h-[96px] rounded-full flex items-center justify-center text-[43px] border-[2.5px] z-10 mb-3.5 animate-float"
                  style={{ background: 'linear-gradient(135deg,var(--oc-accent),#0B1A3A)', borderColor: 'color-mix(in srgb, var(--oc-accent) 42%, transparent)', boxShadow: '0 0 32px color-mix(in srgb, var(--oc-accent) 24%, transparent)' }}
                >
                  📋
                </div>
                <div className="text-white text-[16px] font-medium text-center z-10 leading-[1.2]">{coach.fullName}</div>
                <div className="z-10 mt-1 text-center text-[12px] text-[color-mix(in_srgb,var(--oc-accent)_72%,white)]">{coach.currentClub || 'Sin club actual'}</div>
                <div className="mt-4 z-10 rounded-[10px] border border-[color-mix(in_srgb,var(--oc-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_10%,transparent)] px-5 py-2 text-center">
                  <div className="text-[29px] font-medium leading-none tracking-[-0.02em] text-[var(--oc-accent)]">{coach.years || '—'}</div>
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.06em] mt-0.5">Años exp.</div>
                </div>
              </div>
              {/* Right panel */}
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge status={coach.status} />
                  <span className="text-[rgba(255,255,255,0.25)] text-[12px]">{coach.nationality}</span>
                  {coach.age > 0 && (
                    <>
                      <span className="text-[rgba(255,255,255,0.1)]">·</span>
                      <span className="text-[rgba(255,255,255,0.25)] text-[12px]">{coach.age} años</span>
                    </>
                  )}
                </div>
                <h1 className="text-[31px] leading-[1.03] font-semibold tracking-[-0.04em] text-white">Perfil técnico</h1>
                <p className="mt-2 text-[14px] leading-[1.65] text-[var(--oc-text-muted)]">Información profesional del técnico, su experiencia y enfoque de trabajo.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
                  {[['Experiencia',`${coach.years || '—'} años`],['Edad',coach.age ? `${coach.age} años` : '—'],['Club',coach.currentClub || 'Libre']].map(([l,v]) => (
                    <div key={l} className="rounded-[9px] border border-[color-mix(in_srgb,var(--oc-accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_8%,transparent)] p-[10px_12px] text-center">
                      <div className="truncate text-[14px] font-medium leading-none text-[var(--oc-accent)]">{v}</div>
                      <div className="text-[rgba(255,255,255,0.25)] text-[10px] mt-[3px] uppercase tracking-[0.05em]">{l}</div>
                    </div>
                  ))}
                </div>
                {coach.skills && coach.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-2">Habilidades</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {coach.skills.map(s => (
                        <span key={s} className="oc-role-chip px-[11px] py-1 text-[11px]" style={{ '--oc-accent': accent } as CSSProperties}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {coach.languages && coach.languages.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-[6px] w-[6px] rounded-full bg-[var(--oc-accent)] shadow-[0_0_6px_color-mix(in_srgb,var(--oc-accent)_60%,transparent)]" />
                    <span className="text-[rgba(255,255,255,0.5)] text-[13px]">Idiomas: {coach.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav className="mb-5 grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[13px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6">
            {['Resumen', 'Trayectoria', 'Habilidades', 'Videos', 'Palmarés', 'Estado'].map((tab, i) => (
              <button key={tab} type="button" onClick={() => setActiveTab(i)} className={`flex items-center justify-center border-b-2 cursor-pointer bg-transparent transition-colors ${activeTab === i ? 'border-[var(--oc-blue)] text-[var(--oc-blue)]' : 'border-transparent hover:text-white'}`}>{tab}</button>
            ))}
          </nav>

          {/* Two-col */}
          <div className="grid gap-[var(--oc-space-4)] lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-3.5">
              {(activeTab === 0 || activeTab === 2) && coach.bio && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Sobre el técnico</div>
                  <p className="text-[rgba(255,255,255,0.5)] text-[13px] leading-[1.8]">{coach.bio}</p>
                </div>
              )}
              {(activeTab === 0 || activeTab === 1) && coach.career && coach.career.length > 0 && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Trayectoria</div>
                  <div className="flex flex-col gap-2">
                    {coach.career.map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`h-[7px] w-[7px] shrink-0 rounded-full ${i === 0 ? 'bg-[var(--oc-accent)]' : 'bg-white/15'}`} />
                        <span className={`flex-1 text-[13px] ${i === 0 ? 'text-white' : 'text-white/50'}`}>{c.club}</span>
                        <span className="text-[rgba(255,255,255,0.35)] text-[11px] italic">{c.role}</span>
                        <span className="text-[rgba(255,255,255,0.2)] text-[11px]">{c.years}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(activeTab === 0 || activeTab === 2 || activeTab === 4) && coach.trophies && coach.trophies.length > 0 && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Palmarés</div>
                  <div className="flex flex-col gap-1.5">
                    {coach.trophies.map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className="text-[15px]">🏆</span>
                        <span className="text-[rgba(255,255,255,0.5)] text-[13px]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(activeTab === 0 || activeTab === 3) && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2.5">Videos</div>
                  {videos.length === 0 ? (
                    <p className="text-[13px] text-[rgba(255,255,255,0.35)]">Este técnico aún no publicó videos.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {videos.map((video) => (
                        <a key={video.id} href={video.url ?? '#'} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden rounded-[9px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] aspect-video flex items-center justify-center">
                          <div className="absolute inset-0 bg-[rgba(0,0,0,0.25)]" />
                          <div className="relative z-[2] w-9 h-9 rounded-full border border-[rgba(255,255,255,0.5)] flex items-center justify-center text-white text-[13px]">▶</div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {(activeTab === 0 || activeTab === 5) && (
                <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-4)]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2">Club actual</div>
                  <div className="text-white text-[15px] font-medium">{coach.currentClub || 'Sin club'}</div>
                </div>
              )}
              <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--oc-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_8%,transparent)] p-4">
                <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.08em] mb-2">Contacto</div>
                <p className="text-[rgba(255,255,255,0.35)] text-[12px] leading-[1.6] mb-3">
                  {user ? 'Enviá un mensaje directo a este técnico.' : 'Para contactar a este técnico, iniciá sesión o registrá tu institución.'}
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
