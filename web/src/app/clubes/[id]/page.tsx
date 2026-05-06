'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import { getClub } from '@/lib/firestore'
import type { ClubProfile } from '@/types'

export default function ClubProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [club, setClub] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { getClub(id).then(c => { setClub(c); setLoading(false) }) }, [id])

  if (loading) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  if (!club) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Club no encontrado.</div></div>

  const accent = '#FFB400'
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
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-detail oc-page-block">
          <Button variant="ghost" onClick={() => router.push('/clubes')} className="mb-5 text-[11px]">← Volver a clubes</Button>

          <div className="mb-4 overflow-hidden rounded-[16px] border border-[rgba(255,180,0,0.28)] bg-[linear-gradient(130deg,#07101a,#111c2a_52%,#201805)] shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg,${accent},transparent)` }} />
            <div className="grid md:grid-cols-[260px_1fr]">
              <div className="relative flex min-h-[220px] flex-col items-center justify-center border-b border-[rgba(255,255,255,0.1)] px-6 py-7 md:border-b-0 md:border-r md:border-[rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(158deg,transparent_0_16px,rgba(255,255,255,0.05)_17px,transparent_18px)] opacity-55" />
                <div className="relative z-10 grid h-[96px] w-[96px] place-items-center rounded-[22px] border border-[rgba(255,180,0,0.45)] bg-[rgba(255,180,0,0.16)] text-[34px] shadow-[0_18px_48px_rgba(0,0,0,0.45)]">🏟️</div>
                <p className="relative z-10 mt-4 text-[20px] font-semibold tracking-[-0.03em] text-white text-center">{club.name}</p>
                <p className="relative z-10 mt-1 text-[12px] text-oc-yellow">{club.division || 'Sin categoria'}</p>
                {club.founded > 0 && <p className="relative z-10 mt-3 text-[11px] text-[var(--oc-text-muted)]">Fundado en {club.founded}</p>}
              </div>

              <div className="p-5 md:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-[20px] border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.1)] px-2.5 py-1 text-[10px] tracking-[0.07em] text-oc-yellow">{statusLabel[club.status]}</span>
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
                    <div key={l} className="rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">{l}</p>
                      <p className="mt-1 truncate text-[13px] text-white">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Presidente</p>
                    <p className="mt-1 text-[13px] text-white">{club.president || 'No informado'}</p>
                  </div>
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Director tecnico</p>
                    <p className="mt-1 text-[13px] text-white">{club.currentCoach || 'No informado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <section className="rounded-[12px] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.02)] p-5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Sobre el club</p>
                <p className="mt-2 text-[13px] leading-[1.75] text-[var(--oc-text-muted)]">{club.bio || 'Este club aun no cargo una descripcion institucional.'}</p>
              </section>

              <section className="rounded-[12px] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.02)] p-5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Busqueda actual de talento</p>
                {hasSeeking ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {club.seeking.map(s => (
                      <span key={s} className="rounded-[20px] border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.12)] px-[11px] py-1 text-[10px] text-oc-yellow">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] text-[var(--oc-text-faint)]">Sin posiciones abiertas publicadas.</p>
                )}
              </section>

              <section className="rounded-[12px] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.02)] p-5">
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
              <div className="rounded-[12px] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.02)] p-4">
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

              <div className="rounded-[12px] border border-[rgba(255,180,0,0.3)] bg-[rgba(255,180,0,0.08)] p-4">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Contacto</p>
                <p className="mt-2 text-[12px] leading-[1.65] text-[var(--oc-text-muted)]">Para contactar a este club, inicia sesion o registrate en One Chance.</p>
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => router.push('/auth?tab=register')}>Contactar</Button>
              </div>

              <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => router.push('/clubes')}>Volver al listado</Button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
