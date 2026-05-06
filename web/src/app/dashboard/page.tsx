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
import { AgentEditForm, ClubEditForm, CoachEditForm, PlayerEditForm } from '@/features/dashboard/components/RoleEditForms'
import StatusCard from '@/features/dashboard/components/StatusCard'
import PhotosSection from '@/features/dashboard/components/sections/PhotosSection'
import SettingsSection from '@/features/dashboard/components/sections/SettingsSection'
import VideosSection from '@/features/dashboard/components/sections/VideosSection'
import { useDashboardProfile } from '@/features/dashboard/hooks/useDashboardProfile'
import type { AgentProfile, ClubProfile, CoachProfile, PlayerProfile, Role } from '@/types'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'edit' | 'videos' | 'photos' | 'settings'>('overview')
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

  if (authLoading || loadingProfile) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  if (!user) return null

  const role = user.role as Role
  const accent = role ? ROLE_ACCENT[role] : '#00C853'
  const tabs = [
    { id: 'overview', icon: '◉', label: 'Mi perfil' },
    { id: 'edit', icon: '✎', label: 'Editar datos' },
    ...(role === 'player' ? [{ id: 'videos', icon: '▶', label: 'Videos' }] : []),
    { id: 'photos', icon: '□', label: 'Fotos' },
    { id: 'settings', icon: '⚙', label: 'Configuracion' },
  ] as { id: typeof tab; icon: string; label: string }[]

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block max-w-[980px]">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <div className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] rounded-full flex items-center justify-center text-[22px] lg:text-[26px] border-[2px]" style={{ background: `linear-gradient(135deg,${accent},${accent}44)`, borderColor: `${accent}66` }}>
              {role ? ROLE_ICONS[role] : '👤'}
            </div>
            <div>
              <div className="text-white text-[20px] lg:text-[24px] font-medium">{user.name || user.email}</div>
              <div className="text-[12px] mt-0.5" style={{ color: accent }}>{role ? ROLE_LABELS[role] : 'Usuario'}</div>
            </div>
            {profile && <div className="ml-auto"><Badge status={profile.status} /></div>}
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-4 lg:gap-6 items-start">
            <aside className="w-full lg:w-[240px] shrink-0 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] overflow-hidden lg:sticky lg:top-[calc(var(--oc-nav-height)+var(--oc-space-4))]">
              {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className="w-full h-[44px] lg:h-[48px] px-3.5 lg:px-4 border-none border-b border-[rgba(255,255,255,0.04)] text-left cursor-pointer flex items-center gap-2.5" style={{ background: tab === t.id ? `${accent}18` : 'transparent', boxShadow: tab === t.id ? `inset 2px 0 0 ${accent}` : 'none' }}><span className="text-[12px]" style={{ color: tab === t.id ? accent : 'rgba(255,255,255,0.28)' }}>{t.icon}</span><span className="text-[12px]" style={{ color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.42)' }}>{t.label}</span></button>)}
            </aside>

            <div className="min-w-0 flex flex-col gap-4">
              {tab === 'overview' && (
                <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                  <div className="flex flex-col gap-4">
                    {profile ? <StatusCard profile={profile} state={state} role={role} onSubmit={handleSubmit} /> : <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-[rgba(255,255,255,0.35)] text-[12px]">No se encontro tu perfil. Intenta cerrar sesion y volver a ingresar.</div>}
                    {role === 'player' && profile && (
                      <SurfaceCard>
                        <SectionKicker className="mb-3">Datos del jugador</SectionKicker>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ['Posicion', (profile as PlayerProfile).position || '—'],
                            ['Nacionalidad', (profile as PlayerProfile).nationality || '—'],
                            ['Pie', (profile as PlayerProfile).strongFoot || '—'],
                            ['Club', (profile as PlayerProfile).currentClub || 'Libre'],
                          ].map(([l, v]) => <div key={l}><div className="text-[rgba(255,255,255,0.22)] text-[10px] uppercase tracking-[0.06em]">{l}</div><div className="text-white text-[13px] mt-0.5">{v}</div></div>)}
                        </div>
                      </SurfaceCard>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <SurfaceCard className="p-4">
                      <SectionKicker className="mb-3">Acciones rapidas</SectionKicker>
                      <div className="flex flex-col gap-1.5">
                        {profile && role && <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => router.push(`/${ROLE_ROUTE[role]}/${user.uid}`)}>Ver mi perfil publico -&gt;</Button>}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('edit')}>Editar informacion -&gt;</Button>
                        {role === 'player' && <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('videos')}>Gestionar videos -&gt;</Button>}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('photos')}>Gestionar fotos -&gt;</Button>
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

              {tab === 'videos' && role === 'player' && <VideosSection uid={user.uid} />}
              {tab === 'photos' && <PhotosSection uid={user.uid} />}
              {tab === 'settings' && <SettingsSection uid={user.uid} state={state} onStateChange={setState} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
