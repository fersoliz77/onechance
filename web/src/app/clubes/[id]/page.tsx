'use client'
import { type CSSProperties, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import ContactModal from '@/components/ui/ContactModal'
import { getClub } from '@/lib/firestore'
import { getProfileState } from '@/lib/rtdb'
import { useAuth } from '@/context/AuthContext'
import { canViewProfile } from '@/lib/publicProfileAccess'
import type { ClubProfile } from '@/types'

export default function ClubProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [club, setClub] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [showContactCta, setShowContactCta] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    let active = true
    ;(async () => {
      const [cRes, sRes] = await Promise.allSettled([getClub(id), getProfileState(id)])
      if (!active) return

      setClub(cRes.status === 'fulfilled' ? cRes.value : null)
      setShowContactCta(sRes.status === 'fulfilled' ? Boolean(sRes.value?.visibility?.showContact) : false)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [id])

  if (loading) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  if (!club) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Club no encontrado.</div></div>

  const canView = canViewProfile({
    profileStatus: club.status,
    profileUid: club.uid,
    viewerUid: user?.uid,
    viewerSystemRole: user?.systemRole,
  })
  if (!canView) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Este perfil no esta disponible publicamente.</div></div>

  const accent = 'var(--oc-role-club)'

  function handleContact() {
    if (user) setShowContact(true)
    else router.push('/auth?tab=register')
  }

  const hasSeeking = club.seeking && club.seeking.length > 0
  const hasAchievements = club.achievements && club.achievements.length > 0
  const statusLabel: Record<ClubProfile['status'], string> = {
    published: 'Publicado',
    pending: 'Pendiente',
    draft: 'Borrador',
    rejected: 'Rechazado',
    hidden: 'Oculto',
  }

  return (
    <div className="relative min-h-screen bg-[var(--oc-bg-base)] text-white">
      <Background />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_15%,rgba(255,180,0,0.1),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(0,195,255,0.07),transparent_30%)]" />
      {showContact && club && (
        <ContactModal toUid={id} toName={club.name} accent={accent} onClose={() => setShowContact(false)} />
      )}
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell oc-page-block">
          <Button variant="ghost" onClick={() => router.push('/clubes')} className="mb-5 text-[11px]">← Volver a clubes</Button>

          <div className="oc-detail-hero mb-1" style={{ '--oc-accent': accent } as CSSProperties}>
            <div className="oc-detail-hero-accent" />
            <div className="grid md:grid-cols-[260px_1fr]">
              <div className="relative flex min-h-[220px] flex-col items-center justify-center border-b border-white/10 px-6 py-7 md:border-b-0 md:border-r md:border-white/10">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(158deg,transparent_0_16px,rgba(255,255,255,0.05)_17px,transparent_18px)] opacity-55" />
                <div className="relative z-10 grid h-[96px] w-[96px] place-items-center rounded-[22px] border border-[color-mix(in_srgb,var(--oc-accent)_42%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_14%,transparent)] text-[34px] shadow-[0_18px_48px_rgba(0,0,0,0.45)]">🏟️</div>
                <p className="relative z-10 mt-4 text-[20px] font-semibold tracking-[-0.03em] text-white text-center">{club.name}</p>
                <p className="relative z-10 mt-1 text-[12px] text-oc-yellow">{club.division || 'Sin categoria'}</p>
                {club.founded > 0 && <p className="relative z-10 mt-3 text-[11px] text-[var(--oc-text-muted)]">Fundado en {club.founded}</p>}
              </div>

              <div className="p-5 md:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="oc-role-chip px-2.5 py-1 text-[10px] tracking-[0.07em]" style={{ '--oc-accent': accent } as CSSProperties}>{statusLabel[club.status]}</span>
                  <span className="text-[12px] text-[var(--oc-text-faint)]">{club.country || 'Sin pais'} · {club.city || 'Sin ciudad'}</span>
                </div>

                <h1 className="text-[30px] leading-[1.03] font-semibold tracking-[-0.04em] text-white">Perfil institucional</h1>
                <p className="mt-2 text-[13px] leading-[1.65] text-[var(--oc-text-muted)]">Informacion oficial del club, su estructura y necesidades deportivas actuales.</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    ['Pais', club.country || '—'],
                    ['Ciudad', club.city || '—'],
                    ['Division', club.division || '—'],
                    ['Provincia', club.province || '—'],
                  ].map(([l,v]) => (
                    <div key={l} className="rounded-[10px] border border-[color-mix(in_srgb,var(--oc-accent)_15%,var(--oc-border-soft))] bg-[color-mix(in_srgb,var(--oc-accent)_5%,rgba(255,255,255,0.03))] px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">{l}</p>
                      <p className="mt-1 truncate text-[13px] text-white">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--oc-accent)_15%,var(--oc-border-soft))] bg-[color-mix(in_srgb,var(--oc-accent)_5%,rgba(255,255,255,0.03))] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Presidente</p>
                    <p className="mt-1 text-[13px] text-white">{club.president || 'No informado'}</p>
                  </div>
                  <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--oc-accent)_15%,var(--oc-border-soft))] bg-[color-mix(in_srgb,var(--oc-accent)_5%,rgba(255,255,255,0.03))] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Director tecnico</p>
                    <p className="mt-1 text-[13px] text-white">{club.currentCoach || 'No informado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="mb-5 grid h-12 grid-cols-3 rounded-b-[12px] border-x border-b border-[var(--oc-border)] bg-[rgba(6,18,23,0.95)] text-center text-[12px] font-[700] text-[var(--oc-fg-muted)] md:grid-cols-6">
            {['Resumen', 'Institucion', 'Busqueda', 'Logros', 'Contacto', 'Verificacion'].map((tab, i) => (
              <div key={tab} className={`flex items-center justify-center border-b-2 ${i === 0 ? 'border-[var(--oc-yellow)] text-[var(--oc-yellow)]' : 'border-transparent'}`}>{tab}</div>
            ))}
          </nav>

          <div className="grid gap-[var(--oc-space-4)] lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <section className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Sobre el club</p>
                <p className="mt-2 text-[13px] leading-[1.75] text-[var(--oc-text-muted)]">{club.bio || 'Este club aun no cargo una descripcion institucional.'}</p>
              </section>

              <section className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Busqueda actual de talento</p>
                {hasSeeking ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {club.seeking.map(s => (
                      <span key={s} className="oc-role-chip px-[11px] py-1 text-[10px]" style={{ '--oc-accent': accent } as CSSProperties}>{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] text-[var(--oc-text-faint)]">Sin posiciones abiertas publicadas.</p>
                )}
              </section>

              <section className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-5)]">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Logros destacados</p>
                {hasAchievements ? (
                  <div className="mt-3 space-y-2">
                    {club.achievements.map((a, i) => (
                      <div key={`${a}-${i}`} className="flex items-center gap-2.5 text-[13px] text-[var(--oc-text-muted)]">
                        <span className="text-[15px]">🏆</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] text-[var(--oc-text-faint)]">Aun no hay logros cargados.</p>
                )}
              </section>
            </div>

            <aside className="space-y-3">
              <div className="oc-elev-card rounded-[var(--oc-radius-lg)] p-[var(--oc-space-4)]">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Cuerpo directivo</p>
                <div className="mt-3 space-y-2.5">
                  <div>
                    <p className="text-[10px] text-[var(--oc-text-faint)]">Presidente</p>
                    <p className="text-[13px] text-white">{club.president || 'No informado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--oc-text-faint)]">Director deportivo</p>
                    <p className="text-[13px] text-white">{club.currentDirector || 'No informado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--oc-text-faint)]">Director tecnico</p>
                    <p className="text-[13px] text-white">{club.currentCoach || 'No informado'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--oc-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--oc-accent)_8%,transparent)] p-4">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Contacto</p>
                <p className="mt-2 text-[12px] leading-[1.65] text-[var(--oc-text-muted)]">
                  {user ? 'Enviá un mensaje directo a este club.' : 'Para contactar a este club, inicia sesion o registrate en One Chance.'}
                </p>
                {showContactCta ? (
                  <Button variant="primary" size="sm" className="w-full justify-center mt-3" onClick={handleContact}>Contactar</Button>
                ) : (
                  <div className="mt-3 text-[11px] text-[rgba(255,255,255,0.22)]">El contacto directo esta desactivado por este perfil.</div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => router.push('/clubes')}>Volver al listado</Button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
