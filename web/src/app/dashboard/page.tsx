'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import SectionKicker from '@/components/ui/SectionKicker'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { ROLE_ACCENT, ROLE_ICONS, ROLE_LABELS, ROLE_ROUTE } from '@/lib/constants'
import { setOwnProfileStatus } from '@/lib/firestore'
import { submitForReview } from '@/lib/rtdb'
import DashboardSkeleton from '@/components/ui/DashboardSkeleton'
import { AgentEditForm, ClubEditForm, CoachEditForm, PlayerEditForm } from '@/features/dashboard/components/RoleEditForms'
import StatusCard from '@/features/dashboard/components/StatusCard'
import PhotosSection from '@/features/dashboard/components/sections/PhotosSection'
import SettingsSection from '@/features/dashboard/components/sections/SettingsSection'
import VideosSection from '@/features/dashboard/components/sections/VideosSection'
import MessagesSection from '@/features/dashboard/components/sections/MessagesSection'
import { useDashboardProfile } from '@/features/dashboard/hooks/useDashboardProfile'
import { getMissingFields } from '@/lib/completion'
import type { AgentProfile, ClubProfile, CoachProfile, PlayerProfile, Role } from '@/types'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'edit' | 'videos' | 'photos' | 'settings' | 'mensajes'>('overview')
  const { profile, setProfile, state, setState, loadingProfile } = useDashboardProfile(user?.uid, user?.role)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth?tab=login')
  }, [user, authLoading, router])

  const handleSubmit = async () => {
    if (!user || !profile || !user.role) return
    await Promise.all([submitForReview(user.uid), setOwnProfileStatus(user.role, user.uid, 'pending')])
    setProfile(p => p ? { ...p, status: 'pending' } : null)
    setState(s => s ? { ...s, status: 'pending' } : null)
  }

  if (authLoading || loadingProfile) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] oc-main-offset"><div className="oc-shell-content oc-page-block oc-dashboard-scope max-w-[980px]"><DashboardSkeleton /></div></div></div>
  if (!user) return null

  const role = user.role as Role
  const accent = role ? ROLE_ACCENT[role] : '#00C853'
  const tabs = [
    { id: 'overview', icon: '◉', label: 'Mi perfil' },
    { id: 'edit', icon: '✎', label: 'Editar datos' },
    { id: 'videos', icon: '▶', label: 'Videos' },
    { id: 'photos',   icon: '□', label: 'Fotos' },
    { id: 'mensajes', icon: '✉', label: 'Mensajes' },
    { id: 'settings', icon: '⚙', label: 'Configuracion' },
  ] as { id: typeof tab; icon: string; label: string }[]

  return (
    <div className="relative min-h-screen oc-dashboard-page">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block oc-dashboard-scope max-w-[980px]">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <div className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] rounded-full flex items-center justify-center text-[23px] lg:text-[27px] border-[2px]" style={{ background: `linear-gradient(135deg,${accent},${accent}44)`, borderColor: `${accent}66` }}>
              {role ? ROLE_ICONS[role] : '👤'}
            </div>
            <div>
              <div className="text-white text-[21px] lg:text-[25px] font-medium">{user.name || user.email}</div>
              <div className="text-[13px] mt-0.5" style={{ color: accent }}>{role ? ROLE_LABELS[role] : 'Usuario'}</div>
            </div>
            {profile && <div className="ml-auto"><Badge status={profile.status} /></div>}
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-4 lg:gap-6 items-start">
            <aside className="oc-dashboard-card w-full lg:w-[240px] shrink-0 rounded-[12px] overflow-hidden lg:sticky lg:top-[calc(var(--oc-nav-height)+var(--oc-space-4))]">
              {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className="w-full h-[44px] lg:h-[48px] px-3.5 lg:px-4 border-none border-b border-[rgba(255,255,255,0.04)] text-left cursor-pointer flex items-center gap-2.5" style={{ background: tab === t.id ? `${accent}18` : 'transparent', boxShadow: tab === t.id ? `inset 2px 0 0 ${accent}` : 'none' }}><span className="text-[13px]" style={{ color: tab === t.id ? accent : 'rgba(255,255,255,0.28)' }}>{t.icon}</span><span className="text-[13px]" style={{ color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.42)' }}>{t.label}</span></button>)}
            </aside>

            <div className="min-w-0 flex flex-col gap-4">
              {tab === 'overview' && (
                <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                  <div className="flex flex-col gap-4">
                    {profile ? <StatusCard profile={profile} state={state} role={role} onSubmit={handleSubmit} /> : (
                      <div className="oc-dashboard-card rounded-[14px] p-5 text-[13px]">
                        <div className="mb-4 space-y-2" aria-hidden="true">
                          <div className="h-4 w-[58%] rounded bg-[rgba(255,255,255,0.1)] animate-pulse" />
                          <div className="h-3 w-[84%] rounded bg-[rgba(255,255,255,0.08)] animate-pulse" />
                          <div className="h-3 w-[72%] rounded bg-[rgba(255,255,255,0.08)] animate-pulse" />
                        </div>
                        <div>
                          <div className="text-white mb-1.5">Estamos preparando tu perfil...</div>
                          <div className="text-[rgba(255,255,255,0.45)]">Esto puede tardar unos segundos después de crear la cuenta.</div>
                          <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-3 text-[12px] font-semibold text-[var(--oc-lime)] bg-transparent border-none cursor-pointer"
                          >
                            Reintentar carga →
                          </button>
                        </div>
                      </div>
                    )}
                    {profile && role && (() => { const missing = getMissingFields(profile, role); return missing.length > 0 ? (
                      <SurfaceCard className="p-4">
                        <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Completar perfil</div>
                        <div className="flex flex-wrap gap-1.5">
                          {missing.map(f => <span key={f} className="rounded-[20px] border border-[rgba(255,180,0,0.3)] bg-[rgba(255,180,0,0.08)] px-2.5 py-1 text-[11px] text-[rgba(255,180,0,0.85)]">{f}</span>)}
                        </div>
                        <button onClick={() => setTab('edit')} className="mt-3 text-[12px] text-[var(--oc-lime)] cursor-pointer bg-transparent border-none font-sans">Completar ahora →</button>
                      </SurfaceCard>
                    ) : null; })()}
                    {role === 'player' && profile && (
                      <SurfaceCard>
                        <SectionKicker className="mb-3">Datos del jugador</SectionKicker>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ['Posición', (profile as PlayerProfile).position || '—'],
                            ['Nacionalidad', (profile as PlayerProfile).nationality || '—'],
                            ['Pie', (profile as PlayerProfile).strongFoot || '—'],
                            ['Club', (profile as PlayerProfile).currentClub || 'Libre'],
                          ].map(([l, v]) => <div key={l}><div className="text-[rgba(255,255,255,0.22)] text-[11px] uppercase tracking-[0.06em]">{l}</div><div className="text-white text-[14px] mt-0.5">{v}</div></div>)}
                        </div>
                      </SurfaceCard>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <SurfaceCard className="p-4">
                      <SectionKicker className="mb-3">Acciones rápidas</SectionKicker>
                      <div className="flex flex-col gap-1.5">
                        {profile && role && <Button variant="ghost" size="sm" className="w-full justify-start text-[12px]" onClick={() => router.push(`/${ROLE_ROUTE[role]}/${user.uid}`)}>Ver mi perfil publico -&gt;</Button>}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[12px]" onClick={() => setTab('edit')}>Editar informacion -&gt;</Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[12px]" onClick={() => setTab('videos')}>Gestionar videos -&gt;</Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[12px]" onClick={() => setTab('photos')}>Gestionar fotos -&gt;</Button>
                      </div>
                    </SurfaceCard>
                  </div>
                </div>
              )}

              {tab === 'edit' && profile && (
                <div>
                  {role === 'player' && <PlayerEditForm player={profile as PlayerProfile} uid={user.uid} onSaved={setProfile} />}
                  {role === 'coach' && <CoachEditForm coach={profile as CoachProfile} uid={user.uid} onSaved={setProfile} />}
                  {role === 'club' && <ClubEditForm club={profile as ClubProfile} uid={user.uid} onSaved={setProfile} />}
                  {role === 'agent' && <AgentEditForm agent={profile as AgentProfile} uid={user.uid} onSaved={setProfile} />}
                </div>
              )}

              {tab === 'videos' && <VideosSection uid={user.uid} />}
              {tab === 'photos' && <PhotosSection uid={user.uid} />}
              {tab === 'mensajes' && <MessagesSection accent={accent} />}
              {tab === 'settings' && <SettingsSection uid={user.uid} state={state} onStateChange={setState} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
