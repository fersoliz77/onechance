'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import { getPendingProfiles, getAllPlayers, getAllUsers } from '@/lib/firestore'
import { getAllVideos } from '@/lib/rtdb'
import type { PlayerProfile, VideoEntry, ProfileStatus, UserRecord } from '@/types'
import { isAdminRole, isSuperAdminRole } from '@/lib/permissions'
import { logAudit } from '@/lib/auditLog'
import { useToastState } from '@/hooks/useToast'
import { useRateLimit } from '@/hooks/useRateLimit'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader, { type Density } from '@/components/admin/AdminHeader'
import AdminStats from '@/components/admin/AdminStats'
import AdminCharts from '@/components/admin/AdminCharts'
import AdminPendingTable from '@/components/admin/AdminPendingTable'
import AdminActivity from '@/components/admin/AdminActivity'
import AdminVideos from '@/components/admin/AdminVideos'
import AdminQuickActions from '@/components/admin/AdminQuickActions'
import CommandPalette from '@/components/admin/CommandPalette'
import ToastStack from '@/components/admin/ui/ToastStack'
import ConfirmModal from '@/components/admin/ui/ConfirmModal'
import { SkeletonStat, SkeletonCard } from '@/components/admin/ui/Skeleton'

export type PendingItem = {
  uid: string
  fullName?: string
  name?: string
  nationality?: string
  country?: string
  position?: string
  status: ProfileStatus
  isMinor?: boolean
  _col: string
  [key: string]: unknown
}
export type AdminTab = 'dashboard' | 'perfiles' | 'usuarios' | 'solicitudes' | 'videos' | 'estadisticas' | 'configuracion' | 'moderacion' | 'suscripciones'

interface ConfirmState {
  open: boolean
  title: string
  description?: string
  danger?: boolean
  confirmLabel?: string
  onConfirm: () => void
}

const CONFIRM_CLOSED: ConfirmState = { open: false, title: '', onConfirm: () => {} }

export default function AdminPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tab, setTab]         = useState<AdminTab>('dashboard')
  const [pending, setPending] = useState<PendingItem[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [users, setUsers]     = useState<UserRecord[]>([])
  const [videos, setVideos]   = useState<(VideoEntry & { playerUid: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [density, setDensity] = useState<Density>(() =>
    (typeof window !== 'undefined' ? localStorage.getItem('oc-admin-density') as Density | null : null) ?? 'comfortable'
  )
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED)

  const { toasts, toast, remove: removeToast } = useToastState()
  const { execute } = useRateLimit(2000)

  const isAdmin      = isAdminRole(user?.systemRole)
  const isSuperAdmin = isSuperAdminRole(user?.systemRole)

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/')
  }, [user, authLoading, isAdmin, router])

  const toggleDensity = () => setDensity(d => {
    const next = d === 'comfortable' ? 'compact' : 'comfortable'
    localStorage.setItem('oc-admin-density', next)
    return next
  })

  // ⌘K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Load data
  useEffect(() => {
    if (!user || !isAdmin) return
    Promise.allSettled([getPendingProfiles(), getAllPlayers(), getAllVideos(), getAllUsers()]).then(results => {
      const [p, pl, v, u] = results
      if (p.status  === 'fulfilled') setPending(p.value as PendingItem[])
      if (pl.status === 'fulfilled') setPlayers(pl.value)
      if (v.status  === 'fulfilled') setVideos(v.value)
      if (u.status  === 'fulfilled') setUsers(u.value)
      const failed = results.filter(r => r.status === 'rejected')
      setLoadError(failed.length > 0 ? 'No se pudieron cargar algunos datos. Verificá permisos de rol.' : '')
      setLoading(false)
    })
  }, [user, isAdmin])

  // ── API helper ──
  const callAdminApi = useCallback(async (path: string, payload: Record<string, unknown>) => {
    if (!firebaseUser) throw new Error('No auth user')
    const token = await firebaseUser.getIdToken()
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? 'Admin action failed')
    }
  }, [firebaseUser])

  // ── Handlers with toast + audit + rate limit ──
  const handleStatus = useCallback((item: PendingItem, status: ProfileStatus) => {
    execute(`status-${item.uid}`, async () => {
      try {
        await callAdminApi('/api/admin/profile-status', { collection: item._col, uid: item.uid, status })
        setPending(ps => ps.filter(p => p.uid !== item.uid))
        await logAudit(
          { uid: firebaseUser!.uid, email: firebaseUser!.email },
          status === 'published' ? 'approve_profile' : 'reject_profile',
          item.uid, item._col, { name: item.fullName ?? item.name }
        )
        toast.success(status === 'published' ? '✓ Perfil aprobado correctamente' : 'Perfil rechazado')
      } catch (e) {
        toast.error('Error al procesar el perfil')
        console.error(e)
      }
    })
  }, [callAdminApi, execute, firebaseUser, toast])

  const confirmReject = useCallback((item: PendingItem) => {
    setConfirm({
      open: true, danger: true,
      title: 'Rechazar perfil',
      description: `¿Rechazás el perfil de "${item.fullName ?? item.name ?? 'este usuario'}"? Esta acción notificará al jugador.`,
      confirmLabel: 'Sí, rechazar',
      onConfirm: () => { setConfirm(CONFIRM_CLOSED); handleStatus(item, 'rejected') },
    })
  }, [handleStatus])

  const handleFeatured = useCallback(async (uid: string, current: boolean) => {
    try {
      await callAdminApi('/api/admin/featured', { uid, isFeatured: !current })
      setPlayers(ps => ps.map(p => p.uid === uid ? { ...p, isFeatured: !current } : p))
      await logAudit({ uid: firebaseUser!.uid, email: firebaseUser!.email }, 'set_featured', uid, 'players', { isFeatured: !current })
      toast.success(!current ? '★ Perfil destacado' : 'Perfil removido de destacados')
    } catch { toast.error('Error al actualizar destacado') }
  }, [callAdminApi, firebaseUser, toast])

  const handleToggleVideo = useCallback((v: VideoEntry & { playerUid: string }) => {
    execute(`video-${v.id}`, async () => {
      const next = v.status === 'active' ? 'hidden' : 'active'
      try {
        await callAdminApi('/api/admin/video', { playerUid: v.playerUid, videoId: v.id, action: 'toggle', status: next })
        setVideos(vs => vs.map(x => x.id === v.id && x.playerUid === v.playerUid ? { ...x, status: next } : x))
        await logAudit({ uid: firebaseUser!.uid, email: firebaseUser!.email }, 'toggle_video', v.id, 'video', { status: next })
        toast.info(`Video ${next === 'active' ? 'visible' : 'oculto'}`)
      } catch { toast.error('Error al actualizar video') }
    })
  }, [callAdminApi, execute, firebaseUser, toast])

  const confirmRemoveVideo = useCallback((playerUid: string, id: string) => {
    setConfirm({
      open: true, danger: true,
      title: 'Eliminar video',
      description: 'Esta acción es permanente y no puede deshacerse.',
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        setConfirm(CONFIRM_CLOSED)
        try {
          await callAdminApi('/api/admin/video', { playerUid, videoId: id, action: 'delete' })
          setVideos(vs => vs.filter(v => !(v.playerUid === playerUid && v.id === id)))
          await logAudit({ uid: firebaseUser!.uid, email: firebaseUser!.email }, 'delete_video', id, 'video')
          toast.success('Video eliminado')
        } catch { toast.error('Error al eliminar video') }
      },
    })
  }, [callAdminApi, firebaseUser, toast])

  const handleSetSystemRole = useCallback(async (uid: string, systemRole: 'user' | 'admin' | 'super_admin') => {
    try {
      await callAdminApi('/api/admin/system-role', { uid, systemRole })
      setUsers(us => us.map(u => u.uid === uid ? { ...u, systemRole } : u))
      await logAudit({ uid: firebaseUser!.uid, email: firebaseUser!.email }, 'set_role', uid, 'users', { systemRole })
      toast.success(`Rol actualizado a "${systemRole.replace('_', ' ')}"`)
    } catch { toast.error('Error al cambiar el rol') }
  }, [callAdminApi, firebaseUser, toast])

  // ── Loading state ──
  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen bg-[#0A0A0A] flex items-start">
        <Background />
        <div className="relative z-10 w-60 h-screen border-r border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,10,0.9)] shrink-0" />
        <div className="relative z-10 flex-1 p-7 space-y-6">
          <div className="grid grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <SkeletonStat key={i} />)}</div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const publishedPlayers  = players.filter(p => p.status === 'published')
  const featuredPlayers   = players.filter(p => p.isFeatured)
  const roleDistribution  = {
    player: users.filter(u => u.role === 'player').length,
    coach:  users.filter(u => u.role === 'coach').length,
    club:   users.filter(u => u.role === 'club').length,
    agent:  users.filter(u => u.role === 'agent').length,
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(170,255,0,0.07),transparent_50%),radial-gradient(ellipse_at_10%_30%,rgba(123,63,246,0.06),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNav={t => setTab(t)} />

      {/* Confirm Modal */}
      <ConfirmModal {...confirm} onCancel={() => setConfirm(CONFIRM_CLOSED)} />

      {/* Toast stack */}
      <ToastStack toasts={toasts} onRemove={removeToast} />

      {/* Sidebar */}
      <AdminSidebar tab={tab} onTab={setTab} pendingCount={pending.length} isSuperAdmin={isSuperAdmin} />

      {/* Main — shifts with sidebar via the spacer inside AdminSidebar */}
      <main className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          user={user}
          photoURL={firebaseUser?.photoURL}
          pendingCount={pending.length}
          density={density}
          onDensityToggle={toggleDensity}
          onViewSite={() => window.open('/', '_blank')}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <div className="flex-1 px-7 pb-12 pt-6 space-y-6">
          {loadError && (
            <div className="rounded-xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.07)] px-5 py-3 text-sm text-[rgba(245,200,80,0.95)] flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              {loadError}
            </div>
          )}

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <>
              <AdminStats totalUsers={users.length} published={publishedPlayers.length} pending={pending.length} videos={videos.length} roleDistribution={roleDistribution} />
              <AdminCharts roleDistribution={roleDistribution} totalUsers={users.length} />
              <div className="grid grid-cols-[1fr_360px] gap-6">
                <AdminPendingTable items={pending.slice(0,6)} onApprove={i => handleStatus(i,'published')} onReject={confirmReject} compact density={density} />
                <AdminActivity pending={pending} players={players} videos={videos} />
              </div>
              <div className="grid grid-cols-[1fr_360px] gap-6">
                <AdminVideos videos={videos.slice(0,3)} onToggle={handleToggleVideo} onRemove={confirmRemoveVideo} compact />
                <AdminQuickActions />
              </div>
            </>
          )}

          {/* SOLICITUDES */}
          {tab === 'solicitudes' && (
            <AdminPendingTable items={pending} onApprove={i => handleStatus(i,'published')} onReject={confirmReject} density={density} />
          )}

          {/* PERFILES */}
          {tab === 'perfiles' && (
            <div className="space-y-4">
              <SectionHeader title="Gestión de perfiles" subtitle={`${publishedPlayers.length} publicados · ${featuredPlayers.length} destacados`} />
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.07)]">
                      {['Jugador','Posición','Nacionalidad','Estado','Destacado','Acciones'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {publishedPlayers.map(p => (
                      <tr key={p.uid} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF00] to-[#7B3FF6] flex items-center justify-center text-[10px] font-black text-black shrink-0">
                              {(p.fullName?.[0] ?? '?').toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{p.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[rgba(255,255,255,0.5)]">{p.position ?? '—'}</td>
                        <td className="px-5 py-3 text-[rgba(255,255,255,0.5)]">{p.nationality ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[rgba(170,255,0,0.1)] text-[#AAFF00] border border-[rgba(170,255,0,0.28)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />Publicado
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleFeatured(p.uid, p.isFeatured)}
                            className="text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border-none"
                            style={{ background: p.isFeatured ? 'rgba(170,255,0,0.12)' : 'rgba(255,255,255,0.06)', color: p.isFeatured ? '#AAFF00' : 'rgba(255,255,255,0.4)' }}>
                            {p.isFeatured ? '★ Destacado' : '☆ Destacar'}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <button className="text-[11px] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent">
                            Ver perfil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {publishedPlayers.length === 0 && (
                  <div className="py-16 text-center text-[rgba(255,255,255,0.2)] text-sm">No hay perfiles publicados.</div>
                )}
              </div>
            </div>
          )}

          {/* USUARIOS */}
          {tab === 'usuarios' && (
            <div className="space-y-4">
              <SectionHeader title="Gestión de usuarios" subtitle={`${users.length} usuarios registrados`} />
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.07)]">
                      {['Usuario','Rol','Sistema','Acciones'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.uid} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[10px] font-bold shrink-0">
                              {((u.name || u.email)?.[0] ?? '?').toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.name || '—'}</p>
                              <p className="text-[11px] text-[rgba(255,255,255,0.3)]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-3">
                          <span className="text-[11px] px-2 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]">{u.systemRole ?? 'user'}</span>
                        </td>
                        <td className="px-5 py-3">
                          {isSuperAdmin && (
                            <div className="flex gap-1.5">
                              {(['user','admin','super_admin'] as const).map(role => (
                                <button key={role} onClick={() => handleSetSystemRole(u.uid, role)}
                                  className="text-[10px] px-2 py-1 rounded-md cursor-pointer font-sans border-none transition-all"
                                  style={{ background: u.systemRole === role ? 'rgba(170,255,0,0.15)' : 'rgba(255,255,255,0.06)', color: u.systemRole === role ? '#AAFF00' : 'rgba(255,255,255,0.4)' }}>
                                  {role.replace('_',' ')}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <div className="py-16 text-center text-[rgba(255,255,255,0.2)] text-sm">No hay usuarios registrados.</div>}
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {tab === 'videos' && (
            <AdminVideos videos={videos} onToggle={handleToggleVideo} onRemove={confirmRemoveVideo} />
          )}

          {/* ESTADÍSTICAS */}
          {tab === 'estadisticas' && (
            <div className="space-y-6">
              <SectionHeader title="Estadísticas de la plataforma" subtitle="Métricas y distribución de perfiles" />
              <AdminStats totalUsers={users.length} published={publishedPlayers.length} pending={pending.length} videos={videos.length} roleDistribution={roleDistribution} />
              <AdminCharts roleDistribution={roleDistribution} totalUsers={users.length} />
            </div>
          )}

          {/* OTROS TABS */}
          {(tab === 'configuracion' || tab === 'moderacion' || tab === 'suscripciones') && (
            <div className="space-y-4">
              <SectionHeader
                title={tab === 'configuracion' ? 'Configuración del sitio' : tab === 'moderacion' ? 'Moderación' : 'Suscripciones'}
                subtitle="Próximamente disponible"
              />
              <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.2)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[rgba(170,255,0,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </div>
                <p className="text-[rgba(255,255,255,0.3)] text-sm">Esta sección está en desarrollo.</p>
              </div>
            </div>
          )}
        </div>

        <footer className="px-7 py-5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] text-[rgba(255,255,255,0.2)]">
          <span>One Chance Admin Panel © 2025</span>
          <span>v2.0.0</span>
        </footer>
      </main>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-[rgba(255,255,255,0.35)] mt-0.5">{subtitle}</p>}
    </div>
  )
}

function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    player: { label:'Jugador',       color:'#AAFF00', bg:'rgba(170,255,0,0.1)' },
    coach:  { label:'Técnico',       color:'#22D3EE', bg:'rgba(34,211,238,0.1)' },
    club:   { label:'Club',          color:'#3B82F6', bg:'rgba(59,130,246,0.1)' },
    agent:  { label:'Representante', color:'#7B3FF6', bg:'rgba(123,63,246,0.1)' },
  }
  const s = map[role ?? ''] ?? { label: role ?? '—', color:'rgba(255,255,255,0.4)', bg:'rgba(255,255,255,0.06)' }
  return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ color:s.color, background:s.bg }}>{s.label}</span>
}
