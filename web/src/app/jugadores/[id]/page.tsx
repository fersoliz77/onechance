'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { getPlayer } from '@/lib/firestore'
import { getProfileState, getVideos, getPublishedPhotos, isFollowing, setFollow, subscribeProfileVisits, type PhotoEntry } from '@/lib/rtdb'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import ContactModal from '@/components/ui/ContactModal'
import ProfileSkeleton from '@/components/ui/ProfileSkeleton'
import { canViewProfile } from '@/lib/publicProfileAccess'
import { registerProfileVisit } from '@/lib/profileViews'
import type { PlayerProfile, VideoEntry } from '@/types'
import VideoCard from '@/components/ui/VideoCard'

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

function toFootLabel(value: string) {
  if (value === 'Der') return 'Derecha'
  if (value === 'Izq') return 'Izquierda'
  if (value === 'Ambas') return 'Ambas'
  return value || 'N/D'
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.78)] shadow-[0_0_0_1px_rgba(0,212,255,0.04),0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}>
      {children}
    </section>
  )
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-[17px] font-[700] tracking-[-0.01em] text-white">{title}</h3>
      {action ? <span className="ml-auto text-[13px] font-[700] text-[var(--oc-lime)]">{action}</span> : null}
    </div>
  )
}


export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, firebaseUser } = useAuth()
  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [showContactCta, setShowContactCta] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [following, setFollowing] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportNotice, setReportNotice] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [visits, setVisits] = useState(0)

  const galleryUrls = photos.length > 0
    ? photos.map((p) => p.url).filter(Boolean)
    : (player?.photoGallery || [])

  useEffect(() => {
    let active = true
    ;(async () => {
      const [pRes, vRes, sRes, phRes] = await Promise.allSettled([getPlayer(id), getVideos(id), getProfileState(id), getPublishedPhotos(id)])
      if (user?.uid) isFollowing(user.uid, id).then(setFollowing).catch(() => {})
      if (!active) return

      setPlayer(pRes.status === 'fulfilled' ? pRes.value : null)
      setVideos(vRes.status === 'fulfilled' ? vRes.value.filter((x) => x.status === 'published') : [])
      setPhotos(phRes.status === 'fulfilled' ? phRes.value.filter((p) => p.status === 'published').sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [])
      setShowContactCta(sRes.status === 'fulfilled' ? Boolean(sRes.value?.visibility?.showContact) : false)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [id, user?.uid])

  useEffect(() => subscribeProfileVisits(id, setVisits), [id])

  useEffect(() => {
    if (!player) return
    const canView = canViewProfile({
      profileStatus: player.status,
      profileUid: player.uid,
      viewerUid: user?.uid,
      viewerSystemRole: user?.systemRole,
    })
    if (!canView) return
    registerProfileVisit(id, user?.uid)
  }, [id, player, user?.systemRole, user?.uid])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-[2] oc-main-offset"><div className="oc-shell-content oc-page-block max-w-[1100px]"><ProfileSkeleton /></div></div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-[2] pt-28 text-center">
          <div className="mb-4 text-[15px] text-[rgba(255,255,255,0.35)]">Jugador no encontrado.</div>
          <Button variant="outline" size="sm" onClick={() => router.push('/jugadores')}>← Volver al listado</Button>
        </div>
      </div>
    )
  }

  const canView = canViewProfile({
    profileStatus: player.status,
    profileUid: player.uid,
    viewerUid: user?.uid,
    viewerSystemRole: user?.systemRole,
  })

  if (!canView) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-[2] pt-28 text-center">
          <div className="mb-4 text-[15px] text-[rgba(255,255,255,0.35)]">Este perfil no está disponible públicamente.</div>
          <Button variant="outline" size="sm" onClick={() => router.push('/jugadores')}>← Volver al listado</Button>
        </div>
      </div>
    )
  }

  const age = computeAge(player.birthDate)
  const stats = [
    ['Altura', player.height ? `${player.height} m` : 'N/D'],
    ['Peso', player.weight ? `${player.weight} kg` : 'N/D'],
    ['Pierna hábil', toFootLabel(player.strongFoot)],
    ['Categoria', player.currentClub ? 'Competitiva' : 'Libre'],
    ['Estado', player.status === 'published' ? 'Verificado' : 'En revision'],
    ['N de perfil', player.uid.slice(0, 5).toUpperCase()],
  ]

  const topStats = [
    ['Estado', player.status === 'published' ? 'Publicado' : 'En revision'],
    ['Edad', age === 'N/D' ? 'No informada' : `${age} años`],
    ['Nacionalidad', player.nationality || 'N/D'],
    ['Posición', player.position || 'N/D'],
    ['Club', player.currentClub || 'Libre'],
    ['Perfil ID', player.uid.slice(0, 8).toUpperCase()],
    ['Visitas', visits.toLocaleString('es-AR')],
  ]

  function handleContact() {
    if (user) setShowContact(true)
    else router.push('/auth?tab=register')
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: player!.fullName, url }) } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setShareMsg('¡Link copiado!')
      setTimeout(() => setShareMsg(''), 2500)
    }
  }

  async function handleFollow() {
    if (!user) { router.push('/auth?tab=register'); return }
    const next = !following
    setFollowing(next)
    await setFollow(user.uid, id, next).catch(() => setFollowing(!next))
  }

  async function handleSendReport() {
    if (!reportText.trim()) return
    if (!firebaseUser || !user) {
      router.push('/auth?tab=register')
      return
    }

    setReportSending(true)
    setReportNotice('')
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUid: id,
          targetRole: 'player',
          reason: reportText.trim(),
          sourcePath: window.location.pathname,
        }),
      })
      const body = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) throw new Error(body.error ?? 'No se pudo enviar el reporte.')
      setReportNotice('Reporte enviado. Nuestro equipo lo revisará a la brevedad.')
      setReportText('')
      window.setTimeout(() => setShowReport(false), 1400)
    } catch (err) {
      setReportNotice(err instanceof Error ? err.message : 'No se pudo enviar el reporte.')
    } finally {
      setReportSending(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(170,255,0,0.1),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.08),transparent_30%)]" />
      {showContactCta ? (
        <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--oc-border-soft)] bg-[rgba(3,12,16,0.94)] p-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-[520px] gap-2">
            <button onClick={handleFollow} className={`h-11 flex-1 rounded-[8px] border px-4 text-[13px] font-[700] ${following ? 'border-[var(--oc-lime)] bg-[rgba(170,255,0,0.12)] text-[var(--oc-lime)]' : 'border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.28)] text-white'}`}>
              {following ? 'Siguiendo' : 'Seguir'}
            </button>
            <button onClick={handleContact} className="h-11 flex-[1.25] rounded-[8px] bg-[var(--oc-lime)] px-4 text-[14px] font-[800] text-black">
              {user ? 'Contactar ahora' : 'Iniciá sesión para contactar'}
            </button>
          </div>
        </div>
      ) : null}
      {showContact ? <ContactModal toUid={id} toName={player.fullName} accent="var(--oc-lime)" onClose={() => setShowContact(false)} /> : null}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
          <div className="mx-4 w-full max-w-[400px] rounded-[16px] border border-[var(--oc-border)] bg-[rgba(8,20,26,0.97)] p-6">
            <>
              <h3 className="text-[16px] font-[700] text-white">Reportar perfil</h3>
              <p className="mt-1 text-[13px] text-[var(--oc-fg-muted)]">¿Por qué reportás este perfil?</p>
              <textarea
                className="mt-4 w-full rounded-[10px] border border-[var(--oc-border)] bg-[rgba(255,255,255,0.05)] p-3 text-[13px] text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.3)] resize-none"
                rows={4}
                placeholder="Describí el motivo del reporte..."
                value={reportText}
                onChange={(e) => { setReportText(e.target.value); setReportNotice('') }}
              />
              {reportNotice && <p className="mt-3 text-[12px] text-[rgba(255,180,0,0.92)]">{reportNotice}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setShowReport(false)} className="flex-1 rounded-[8px] border border-[var(--oc-border)] py-2 text-[13px] text-[var(--oc-fg-muted)]">Cerrar</button>
                <button onClick={handleSendReport} disabled={!reportText.trim() || reportSending} className="flex-1 rounded-[8px] bg-red-500 py-2 text-[13px] font-[700] text-white disabled:opacity-40">{reportSending ? 'Enviando...' : 'Enviar reporte'}</button>
              </div>
            </>
          </div>
        </div>
      )}

      <div className="relative z-[2] oc-main-offset pb-24 md:pb-12">
        <div className="oc-shell oc-page-block">
          <Button variant="ghost" onClick={() => router.push('/jugadores')} className="mb-5 text-[12px]">← Volver al listado</Button>

          <section className="relative overflow-hidden rounded-b-[var(--oc-radius-lg)] border-x border-b border-[var(--oc-border)] bg-[#031016]">
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45"
                style={{ backgroundImage: `url(${player.coverImageUrl || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2200&auto=format&fit=crop'})` }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
            </div>
            <div className="relative px-[var(--oc-space-5)] pb-[var(--oc-space-5)] pt-[var(--oc-space-4)] md:px-[var(--oc-space-8)] md:pb-[var(--oc-space-8)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[13px] font-[700] text-[var(--oc-fg-muted)]">
                <div className="flex items-center gap-2">
                  <span className="text-white">Inicio</span>
                  <span>›</span>
                  <span>Jugadores</span>
                  <span>›</span>
                  <span>{player.fullName}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare} className="rounded-[8px] border border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 text-[var(--oc-lime)] transition-colors hover:bg-[rgba(170,255,0,0.1)]">
                    {shareMsg || 'Compartir'}
                  </button>
                  <button onClick={() => setShowReport(true)} className="rounded-[8px] border border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 transition-colors hover:bg-[rgba(255,255,255,0.05)]">Reportar</button>
                </div>
              </div>

              <div className="grid min-h-[345px] grid-cols-1 gap-[var(--oc-space-6)] pt-[var(--oc-space-4)] lg:grid-cols-[360px_1fr] lg:gap-[var(--oc-space-8)]">
                <div className="relative hidden h-[345px] lg:block">
                  <div className="absolute bottom-0 left-7 h-[335px] w-[286px] overflow-hidden rounded-t-[var(--oc-radius-lg)] border border-[var(--oc-border-soft)] bg-[linear-gradient(165deg,rgba(170,255,0,0.22),rgba(12,25,15,0.52))] shadow-[0_25px_55px_rgba(0,0,0,.75)]">
                    {(player.avatarUrl || galleryUrls[0]) ? (
                      <Image src={player.avatarUrl || galleryUrls[0]} alt={`Foto de ${player.fullName}`} fill sizes="286px" className="object-cover object-top" />
                    ) : null}
                  </div>
                  <div className="absolute bottom-12 left-4 rounded-[var(--oc-radius-md)] border border-[var(--oc-border-soft)] bg-[rgba(8,22,26,0.82)] px-[var(--oc-space-5)] py-[var(--oc-space-4)] text-[14px] font-[700] backdrop-blur">✓ Perfil verificado</div>
                </div>

                <div className="flex flex-col justify-center pb-2 lg:pr-8">
                  <div className="mb-4 lg:hidden">
                    <div className="h-[180px] w-full overflow-hidden rounded-[12px] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.05)]">
                      {(player.avatarUrl || galleryUrls[0]) ? (
                        <Image src={player.avatarUrl || galleryUrls[0]} alt={`Foto de ${player.fullName}`} fill sizes="(max-width: 1024px) 100vw, 286px" className="object-cover object-top" />
                      ) : null}
                    </div>
                  </div>
                  <h1 className="text-[37px] font-[800] tracking-[-0.03em] text-white md:text-[47px]">{player.fullName}</h1>
                  <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 text-[15px] font-[600] text-slate-200">
                    <span>Posición: {player.position || 'N/D'}</span>
                    <span>{age} años</span>
                    <span>{player.nationality || 'N/D'}</span>
                  </div>
                  <div className="mt-[var(--oc-space-8)] flex items-center gap-[var(--oc-space-5)]">
                    <div className="grid h-12 w-12 place-items-center rounded-[10px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.05)] text-[21px]">⚽</div>
                    <div>
                      <p className="text-[21px] font-[700] text-white">{player.currentClub || 'Jugador libre'}</p>
                      <p className="mt-0.5 text-[14px] text-[var(--oc-fg-muted)]">Perfil en One Chance</p>
                    </div>
                  </div>
                  <div className="mt-[var(--oc-space-6)] flex flex-wrap gap-[var(--oc-space-3)]">
                    {showContactCta ? <button onClick={handleContact} className="h-11 min-w-[160px] rounded-[8px] bg-[var(--oc-lime)] px-5 text-[15px] font-[800] text-black shadow-[0_0_24px_rgba(170,255,0,0.25)]">Contactar</button> : null}
                    <button onClick={handleFollow} className={`h-11 min-w-[160px] rounded-[8px] border px-5 text-[14px] font-[700] transition-all ${following ? 'border-[var(--oc-lime)] bg-[rgba(170,255,0,0.12)] text-[var(--oc-lime)]' : 'border-[var(--oc-border-hi)] bg-[rgba(0,0,0,0.28)]'}`}>
                      {following ? 'Siguiendo ✓' : 'Seguir'}
                    </button>
                  </div>
                  <p className="mt-3 text-[12px] text-[var(--oc-fg-muted)]">Perfil actualizado por su titular. Revisá videos y trayectoria antes de contactar.</p>
                </div>
              </div>

              <div className="relative z-10 grid overflow-hidden rounded-[var(--oc-radius-lg)] border border-[var(--oc-border-strong)] bg-[rgba(6,19,24,0.88)] backdrop-blur md:grid-cols-3 lg:-mt-1 lg:grid-cols-6">
                {stats.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3 border-b border-[var(--oc-border)] px-4 py-3 text-[14px] lg:border-b-0 lg:border-r lg:last:border-r-0">
                    <div className="text-[var(--oc-lime)]">◉</div>
                    <div>
                      <p className="text-[12px] text-[var(--oc-fg-muted)]">{label}</p>
                      <p className="mt-0.5 text-[15px] font-[700] text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <nav role="tablist" className="grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[13px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6" aria-label="Secciones del perfil">
            {['Resumen', 'Trayectoria', 'Estadísticas', 'Características', 'Videos', 'Fotos'].map((tab, i) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center justify-center border-b-2 cursor-pointer bg-transparent transition-colors ${activeTab === i ? 'border-[var(--oc-lime)] text-[var(--oc-lime)]' : 'border-transparent hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="mt-[var(--oc-space-5)] space-y-[var(--oc-space-4)]">

            {/* ── TAB 0: RESUMEN — vista general con un poco de todo ── */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 gap-[var(--oc-space-4)] lg:grid-cols-[260px_300px_300px_1fr]">
                <Surface className="min-h-[255px] p-[var(--oc-space-5)]">
                  <SectionTitle title="Características" />
                  <div className="mt-5 flex flex-wrap gap-2">
                    {player.characteristics?.length
                      ? player.characteristics.map(item => (
                          <span key={item} className="rounded-[20px] border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.08)] px-3 py-1.5 text-[12px] font-[700] text-[var(--oc-lime)]">{item}</span>
                        ))
                      : <p className="text-[13px] text-[var(--oc-fg-muted)]">Sin características cargadas aún.</p>
                    }
                  </div>
                </Surface>
                <Surface className="min-h-[255px] p-[var(--oc-space-5)]">
                  <SectionTitle title="Sobre mi" />
                  <p className="mt-4 text-[14px] leading-[1.7] text-[var(--oc-fg-muted)]">{player.bio || 'Perfil en actualizacion. Muy pronto este jugador tendra su biografia completa y objetivos deportivos.'}</p>
                  <h4 className="mt-5 text-[14px] font-[700] text-white">Idiomas</h4>
                  {player.languages && player.languages.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-3 text-[13px]">
                      {player.languages.map((lang) => (
                        <span key={lang}><b className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--oc-lime)]" />{lang}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[13px] text-[var(--oc-fg-muted)]">Sin idiomas cargados.</p>
                  )}
                </Surface>
                <Surface className="min-h-[255px] p-[var(--oc-space-5)]">
                  <SectionTitle title="Estadísticas generales" />
                  <div className="relative mx-auto mt-4 w-full max-w-[176px] aspect-square">
                    <svg viewBox="0 0 200 200" className="h-full w-full">
                      {[36, 58, 80].map((r) => (
                        <polygon key={r} points={`${100},${100 - r} ${100 + r * 0.86},${100 - r * 0.5} ${100 + r * 0.86},${100 + r * 0.5} ${100},${100 + r} ${100 - r * 0.86},${100 + r * 0.5} ${100 - r * 0.86},${100 - r * 0.5}`} fill="none" stroke="#AAFF00" strokeOpacity="0.24" />
                      ))}
                      <polygon points="100,30 156,70 156,130 100,170 54,130 56,72" fill="rgba(170,255,0,0.16)" stroke="#AAFF00" strokeWidth="2.8" />
                    </svg>
                  </div>
                </Surface>
                <Surface className="min-h-[255px] p-[var(--oc-space-5)]">
                  <div className="space-y-2.5">
                    {topStats.map(([label, value]) => (
                      <div key={label} className="flex border-b border-[var(--oc-border)] pb-2 text-[13px]">
                        <span className="text-[var(--oc-fg-muted)]">{label}</span>
                        <b className="ml-auto text-[17px] text-white">{value}</b>
                      </div>
                    ))}
                  </div>
                </Surface>
              </div>
            )}

            {/* ── TAB 1: TRAYECTORIA ── */}
            {(activeTab === 0 || activeTab === 1) && (
            <div className="grid grid-cols-1 gap-[var(--oc-space-4)] lg:grid-cols-[1fr_300px]">
              {player.career?.length > 0 ? (
                <Surface className="p-[var(--oc-space-5)]">
                  <SectionTitle title="Trayectoria" />
                  <div className="mt-5 space-y-0">
                    {player.career.map((entry, i) => (
                      <div key={`${entry.club}-${entry.years}-${i}`} className="grid grid-cols-[150px_1fr_120px] items-center gap-4 border-b border-[var(--oc-border)] py-4 last:border-b-0 max-md:grid-cols-[1fr]">
                        <div className="flex items-center gap-3 text-[13px] text-[var(--oc-fg-muted)]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--oc-lime)]" />
                          <span>{entry.years}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-[8px] border border-[var(--oc-border)] bg-[rgba(255,255,255,0.05)]">🛡️</div>
                          <p className="font-[700] text-white">{entry.club}</p>
                        </div>
                        <div className="text-right text-[13px] text-[var(--oc-fg-muted)] max-md:text-left">{i === 0 ? 'Actualidad' : 'Historial'}</div>
                      </div>
                    ))}
                  </div>
                </Surface>
              ) : (
                <Surface className="p-[var(--oc-space-5)]">
                  <SectionTitle title="Trayectoria" />
                  <p className="mt-4 text-[14px] text-[var(--oc-fg-muted)]">Este jugador aún no cargó su trayectoria deportiva.</p>
                </Surface>
              )}
              <Surface className="p-5">
                <SectionTitle title="Posición en cancha" />
                <div className="relative mt-4 aspect-[1.65] rounded border border-[rgba(170,255,0,0.24)] bg-[rgba(8,32,23,0.65)]">
                  <div className="absolute inset-3 border border-[rgba(255,255,255,0.12)]" />
                  <div className="absolute left-3 top-1/2 h-16 w-10 -translate-y-1/2 border border-[rgba(255,255,255,0.12)]" />
                  <div className="absolute right-3 top-1/2 h-16 w-10 -translate-y-1/2 border border-[rgba(255,255,255,0.12)]" />
                  <div className="absolute left-1/2 top-0 h-full border-l border-[rgba(255,255,255,0.12)]" />
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.12)]" />
                  <div className="absolute left-[57%] top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--oc-lime)] text-black shadow-[0_0_24px_rgba(170,255,0,0.6)]">▶</div>
                </div>
                <h4 className="mt-4 text-[16px] font-[700] text-white">{player.position || 'Posición principal'}</h4>
              </Surface>
            </div>
            )}

            {/* ── TAB 2: ESTADÍSTICAS ── */}
            {activeTab === 2 && (
              <div className="grid grid-cols-1 gap-[var(--oc-space-4)] lg:grid-cols-2">
                <Surface className="p-[var(--oc-space-5)]">
                  <SectionTitle title="Estadísticas generales" />
                  <div className="relative mx-auto mt-4 w-full max-w-[220px] aspect-square">
                    <svg viewBox="0 0 200 200" className="h-full w-full">
                      {[36, 58, 80].map((r) => (
                        <polygon key={r} points={`${100},${100 - r} ${100 + r * 0.86},${100 - r * 0.5} ${100 + r * 0.86},${100 + r * 0.5} ${100},${100 + r} ${100 - r * 0.86},${100 + r * 0.5} ${100 - r * 0.86},${100 - r * 0.5}`} fill="none" stroke="#AAFF00" strokeOpacity="0.24" />
                      ))}
                      <polygon points="100,30 156,70 156,130 100,170 54,130 56,72" fill="rgba(170,255,0,0.16)" stroke="#AAFF00" strokeWidth="2.8" />
                    </svg>
                  </div>
                </Surface>
                <Surface className="p-[var(--oc-space-5)]">
                  <SectionTitle title="Datos del jugador" />
                  <div className="mt-4 space-y-2.5">
                    {topStats.map(([label, value]) => (
                      <div key={label} className="flex border-b border-[var(--oc-border)] pb-2 text-[13px]">
                        <span className="text-[var(--oc-fg-muted)]">{label}</span>
                        <b className="ml-auto text-[17px] text-white">{value}</b>
                      </div>
                    ))}
                  </div>
                </Surface>
              </div>
            )}

            {/* ── TAB 3: CARACTERÍSTICAS ── */}
            {activeTab === 3 && (
              <div className="grid grid-cols-1 gap-[var(--oc-space-4)] lg:grid-cols-2">
                <Surface className="p-[var(--oc-space-5)]">
                  <SectionTitle title="Características" />
                  <div className="mt-5 flex flex-wrap gap-2">
                    {player.characteristics?.length
                      ? player.characteristics.map(item => (
                          <span key={item} className="rounded-[20px] border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.08)] px-3 py-1.5 text-[12px] font-[700] text-[var(--oc-lime)]">{item}</span>
                        ))
                      : <p className="text-[13px] text-[var(--oc-fg-muted)]">Sin características cargadas aún.</p>
                    }
                  </div>
                </Surface>
                <Surface className="p-[var(--oc-space-5)]">
                  <SectionTitle title="Sobre mi" />
                  <p className="mt-4 text-[14px] leading-[1.7] text-[var(--oc-fg-muted)]">{player.bio || 'Perfil en actualizacion.'}</p>
                  <h4 className="mt-5 text-[14px] font-[700] text-white">Idiomas</h4>
                  {player.languages && player.languages.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-3 text-[13px]">
                      {player.languages.map((lang) => (
                        <span key={lang}><b className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--oc-lime)]" />{lang}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[13px] text-[var(--oc-fg-muted)]">Sin idiomas cargados.</p>
                  )}
                </Surface>
              </div>
            )}

            {/* ── TAB 4: VIDEOS ── */}
            {(activeTab === 0 || activeTab === 4) && videos.length > 0 ? (
              <Surface className="p-[var(--oc-space-5)]">
                <SectionTitle title="Videos destacados" action="Ver todos" />
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  {videos.slice(0, 6).map((video) => <VideoCard key={video.id} video={video} />)}
                </div>
              </Surface>
            ) : activeTab === 4 ? (
              <Surface className="p-[var(--oc-space-5)]">
                <SectionTitle title="Videos" />
                <p className="mt-4 text-[14px] text-[var(--oc-fg-muted)]">Este jugador aún no cargó videos.</p>
              </Surface>
            ) : null}

            <Surface className="p-[var(--oc-space-6)]">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div>
                  <h2 className="text-[29px] font-[800] tracking-[-0.02em] text-white">Contacto del jugador</h2>
                  <p className="mt-3 text-[14px] text-[var(--oc-fg-muted)]">La información de contacto está disponible para usuarios registrados en la plataforma.</p>
                  {user?.uid === id ? (
                    <div className="mt-4">
                      <p className="text-[13px] text-[rgba(255,255,255,0.45)] mb-3">Estás viendo tu propio perfil.</p>
                      <button onClick={() => router.push('/dashboard')} className="h-10 rounded-[8px] border border-[rgba(170,255,0,0.4)] bg-[rgba(170,255,0,0.1)] px-4 text-[13px] font-[700] text-[var(--oc-lime)]">Completar mi perfil →</button>
                    </div>
                  ) : showContactCta ? (
                    <button onClick={handleContact} className="mt-6 h-11 w-full max-w-[320px] rounded-[8px] bg-[var(--oc-lime)] text-[14px] font-[800] text-black">{user ? 'Contactar' : 'Iniciá sesión / Registrate'}</button>
                  ) : (
                    <p className="mt-4 text-[13px] text-[var(--oc-fg-dim)]">El contacto directo está desactivado por este perfil.</p>
                  )}
                </div>
                <div className="rounded-[10px] border border-[var(--oc-border)] p-4">
                  <p className="text-[13px] text-[var(--oc-fg-muted)]">Representante</p>
                  <p className="mt-1 font-[700] text-white">No especificado</p>
                </div>
                <div className="rounded-[10px] border border-[var(--oc-border)] p-4">
                  <p className="text-[13px] text-[var(--oc-fg-muted)]">Club actual</p>
                  <p className="mt-1 font-[700] text-white">{player.currentClub || 'Libre'}</p>
                </div>
                <div className="rounded-[10px] border border-[var(--oc-border)] p-4">
                  <h4 className="font-[700] text-white">Redes sociales</h4>
                  {(player.social?.instagram || player.social?.tiktok || player.social?.youtube) ? (
                    <div className="mt-4 flex flex-col gap-2">
                      {player.social.instagram && (
                        <a href={player.social.instagram.startsWith('http') ? player.social.instagram : `https://instagram.com/${player.social.instagram.replace('@','')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
                          <span className="text-[18px]">◎</span> Instagram
                        </a>
                      )}
                      {player.social.tiktok && (
                        <a href={player.social.tiktok.startsWith('http') ? player.social.tiktok : `https://tiktok.com/${player.social.tiktok.replace('@','@')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
                          <span className="text-[18px]">♪</span> TikTok
                        </a>
                      )}
                      {player.social.youtube && (
                        <a href={player.social.youtube.startsWith('http') ? player.social.youtube : `https://youtube.com/${player.social.youtube}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
                          <span className="text-[18px] text-[var(--oc-lime)]">◉</span> YouTube
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-[13px] text-[var(--oc-fg-muted)]">Sin redes cargadas.</p>
                  )}
                </div>
              </div>
            </Surface>

            {(activeTab === 0 || activeTab === 5) && (
            <Surface className="p-[var(--oc-space-5)]">
              <SectionTitle title="Fotos" action="Ver todas" />
              <div className="mt-[var(--oc-space-4)] grid grid-cols-2 gap-[var(--oc-space-3)] md:grid-cols-3 lg:grid-cols-6">
                {(galleryUrls.length > 0 ? galleryUrls.slice(0, 6).map((url, i) => ({ id: `photo-${i}`, url })) : Array.from({ length: 6 }).map((_, i) => ({ id: `placeholder-${i}`, url: '' }))).map((photo, i) => (
                  <div key={photo.id} className="relative h-[154px] overflow-hidden rounded-[var(--oc-radius-lg)] border border-[var(--oc-border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.46))]">
                    {photo.url ? <Image src={photo.url} alt={`Foto ${i + 1} de ${player.fullName}`} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 154px" className="object-cover" /> : null}
                    {i === 5 && galleryUrls.length > 6 ? <div className="absolute inset-0 grid place-items-center bg-[rgba(0,0,0,0.55)] text-[31px] font-[800]">+{Math.max(galleryUrls.length - 6, 0)}</div> : null}
                  </div>
                ))}
              </div>
            </Surface>
            )}

            <div className="rounded-[12px] border border-[var(--oc-border)] bg-[rgba(6,18,23,0.76)] py-5 text-center text-[14px] text-[var(--oc-fg-muted)]">
              ✓ Este perfil fue verificado y aprobado por el equipo de One Chance.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
