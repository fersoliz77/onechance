'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import { getPendingProfiles, getAllPlayers, getAllUsers, getAllCoaches, getAllClubs, getAllAgents } from '@/lib/firestore'
import { getAllVideos } from '@/lib/rtdb'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, VideoEntry, ProfileStatus, UserRecord } from '@/types'
import { isAdminRole, isSuperAdminRole } from '@/lib/permissions'
import { logAudit, type AuditAction } from '@/lib/auditLog'
import { useToastState } from '@/hooks/useToast'
import { useRateLimit } from '@/hooks/useRateLimit'
import { buildAdminMetrics } from '@/lib/adminMetrics'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader, { type Density } from '@/components/admin/AdminHeader'
import AdminStats from '@/components/admin/AdminStats'
import AdminCharts from '@/components/admin/AdminCharts'
import AdminPendingTable from '@/components/admin/AdminPendingTable'
import AdminActivity from '@/components/admin/AdminActivity'
import AdminVideos from '@/components/admin/AdminVideos'
import AdminQuickActions from '@/components/admin/AdminQuickActions'
import AdminConfigPanel from '@/components/admin/AdminConfigPanel'
import AdminProfilesTab from '@/components/admin/AdminProfilesTab'
import AdminSubscriptionsTab from '@/components/admin/AdminSubscriptionsTab'
import CommandPalette from '@/components/admin/CommandPalette'
import ToastStack from '@/components/admin/ui/ToastStack'
import ConfirmModal from '@/components/admin/ui/ConfirmModal'
import RejectModal from '@/components/admin/ui/RejectModal'
import { SkeletonStat, SkeletonCard } from '@/components/admin/ui/Skeleton'

export type PendingItem = {
  uid: string
  createdAt?: unknown
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
type MonthRange = 3 | 6 | 12

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
  const [monthRange, setMonthRange] = useState<MonthRange>(12)
  const [pending, setPending] = useState<PendingItem[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [clubs,   setClubs]   = useState<ClubProfile[]>([])
  const [agents,  setAgents]  = useState<AgentProfile[]>([])
  const [users, setUsers]     = useState<UserRecord[]>([])
  const [videos, setVideos]   = useState<(VideoEntry & { playerUid: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadError, setLoadError] = useState('')
  const loadedRef = useRef<Set<string>>(new Set())

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [density, setDensity] = useState<Density>(() =>
    (typeof window !== 'undefined' ? localStorage.getItem('oc-admin-density') as Density | null : null) ?? 'comfortable'
  )
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED)
  const [rejectTarget, setRejectTarget] = useState<PendingItem | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')

  const { toasts, toast, remove: removeToast } = useToastState()
  const { execute } = useRateLimit(2000)
  const metrics = useMemo(() => buildAdminMetrics(users, videos, pending, monthRange), [users, videos, pending, monthRange])

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

  // Carga principal: pendientes + usuarios (necesarios para métricas del dashboard)
  useEffect(() => {
    if (!user || !isAdmin) return
    loadedRef.current = new Set() // reset al hacer refresh
    const primarySources = ['solicitudes', 'usuarios'] as const
    Promise.allSettled([getPendingProfiles(), getAllUsers()])
      .then(results => {
        const [p, u] = results
        if (p.status === 'fulfilled') setPending(p.value as PendingItem[])
        if (u.status === 'fulfilled') setUsers(u.value)

        const failed = results
          .map((r, i) => (r.status === 'rejected' ? primarySources[i] : null))
          .filter((x): x is (typeof primarySources)[number] => x !== null)

        setLoadError(
          failed.length > 0
            ? `No se pudieron cargar algunos datos (${failed.join(', ')}). Intentá recargar la página.`
            : ''
        )
        setLoading(false)
      })
  }, [user, isAdmin, refreshKey])

  // Carga lazy: perfiles completos solo cuando se abre la pestaña "perfiles"
  useEffect(() => {
    if (!user || !isAdmin || tab !== 'perfiles') return
    if (loadedRef.current.has('perfiles')) return
    loadedRef.current.add('perfiles')
    setLoadingProfiles(true)
    Promise.allSettled([getAllPlayers(), getAllCoaches(), getAllClubs(), getAllAgents()])
      .then(([pl, co, cl, ag]) => {
        if (pl.status === 'fulfilled') setPlayers(pl.value)
        if (co.status === 'fulfilled') setCoaches(co.value)
        if (cl.status === 'fulfilled') setClubs(cl.value)
        if (ag.status === 'fulfilled') setAgents(ag.value)
      })
      .catch((err) => console.error('[Admin] loadProfiles failed:', err))
      .finally(() => setLoadingProfiles(false))
  }, [user, isAdmin, tab])

  // Carga lazy: videos solo cuando se abre la pestaña "videos"
  useEffect(() => {
    if (!user || !isAdmin || tab !== 'videos') return
    if (loadedRef.current.has('videos')) return
    loadedRef.current.add('videos')
    setLoadingVideos(true)
    getAllVideos()
      .then(setVideos)
      .catch((err) => console.error('[Admin] getAllVideos failed:', err))
      .finally(() => setLoadingVideos(false))
  }, [user, isAdmin, tab])

  // ── API helper ──
  const callAdminApi = useCallback(async (path: string, payload: Record<string, unknown>) => {
    if (!firebaseUser) throw new Error('No auth user')
    const exec = async (forceRefresh = false) => {
      const token = await firebaseUser.getIdToken(forceRefresh)
      return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    }

    let res = await exec(false)
    if (res.status === 401) {
      res = await exec(true)
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      if (res.status === 401) throw new Error('Sesión expirada o no autorizada. Volvé a iniciar sesión.')
      if (res.status === 403) throw new Error('Sin permisos admin. Verificá que tu usuario tenga systemRole admin/super_admin en Firestore.')
      if (res.status === 500) throw new Error(`Error del servidor (500). ${body.error ?? 'Revisá la consola del servidor.'}`)
      throw new Error(body.error ?? `Error HTTP ${res.status}`)
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

  const updateProfilesLocal = useCallback((uid: string, col: string, patch: Partial<{ status: ProfileStatus }>) => {
    const upd = <T extends { uid: string }>(list: T[]) =>
      list.map(item => item.uid === uid ? { ...item, ...patch } : item)
    if      (col === 'players') setPlayers(upd as (prev: typeof players) => typeof players)
    else if (col === 'coaches') setCoaches(upd as (prev: typeof coaches) => typeof coaches)
    else if (col === 'clubs')   setClubs(upd   as (prev: typeof clubs)   => typeof clubs)
    else if (col === 'agents')  setAgents(upd  as (prev: typeof agents)  => typeof agents)
  }, [])

  const confirmReject = useCallback((item: PendingItem) => {
    setRejectTarget(item)
  }, [])

  const handleRejectWithReason = useCallback((reason: string) => {
    if (!rejectTarget) return
    const item = rejectTarget
    setRejectTarget(null)
    execute(`status-${item.uid}`, async () => {
      try {
        const payload: Record<string, unknown> = { collection: item._col, uid: item.uid, status: 'rejected' }
        if (reason) payload.rejectionReason = reason
        await callAdminApi('/api/admin/profile-status', payload)
        setPending(ps => ps.filter(p => p.uid !== item.uid))
        updateProfilesLocal(item.uid, item._col, { status: 'rejected' })
        await logAudit(
          { uid: firebaseUser!.uid, email: firebaseUser!.email },
          'reject_profile', item.uid, item._col, { name: item.fullName ?? item.name, rejectionReason: reason }
        )
        toast.info('Perfil rechazado')
      } catch (e) {
        toast.error('Error al rechazar el perfil')
        console.error('[handleRejectWithReason]', e)
      }
    })
  }, [rejectTarget, execute, callAdminApi, firebaseUser, toast, updateProfilesLocal])

  const handleFeatured = useCallback(async (uid: string, current: boolean) => {
    try {
      await callAdminApi('/api/admin/featured', { uid, isFeatured: !current })
      setPlayers(ps => ps.map(p => p.uid === uid ? { ...p, isFeatured: !current } : p))
      await logAudit({ uid: firebaseUser!.uid, email: firebaseUser!.email }, 'set_featured', uid, 'players', { isFeatured: !current })
      toast.success(!current ? '★ Perfil destacado' : 'Perfil removido de destacados')
    } catch { toast.error('Error al actualizar destacado') }
  }, [callAdminApi, firebaseUser, toast])

  const handleChangeStatus = useCallback(async (uid: string, col: string, newStatus: ProfileStatus) => {
    const AUDIT_ACTION: Record<ProfileStatus, AuditAction> = {
      published: 'publish_profile',
      hidden:    'hide_profile',
      rejected:  'reject_profile',
      pending:   'set_profile_pending',
      draft:     'set_profile_draft',
    }
    try {
      await callAdminApi('/api/admin/profile-status', { collection: col, uid, status: newStatus })
      updateProfilesLocal(uid, col, { status: newStatus })
      await logAudit(
        { uid: firebaseUser!.uid, email: firebaseUser!.email },
        AUDIT_ACTION[newStatus], uid, col, { status: newStatus },
      )
      if (newStatus === 'published') toast.success('✓ Perfil publicado')
      else if (newStatus === 'hidden')   toast.info('Perfil ocultado')
      else if (newStatus === 'rejected') toast.info('Perfil rechazado')
      else if (newStatus === 'pending')  toast.info('Perfil marcado como pendiente')
      else                               toast.info('Perfil movido a borrador')
    } catch (e) {
      console.error('[handleChangeStatus]', e)
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      toast.error(`Error al cambiar estado: ${msg}`)
    }
  }, [callAdminApi, firebaseUser, toast, updateProfilesLocal])

  const handleRequestRejectFromProfiles = useCallback((uid: string, col: string, name: string) => {
    setRejectTarget({ uid, _col: col, fullName: name, status: 'published' } as PendingItem)
  }, [])

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
        <div className="relative z-10 hidden lg:block w-60 h-screen border-r border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,10,0.9)] shrink-0" />
        <div className="relative z-10 flex-1 p-4 md:p-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">{[1,2,3,4,5,6].map(i => <SkeletonStat key={i} />)}</div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const publishedPlayers  = players.filter(p => p.status === 'published')
  const featuredPlayers   = players.filter(p => p.isFeatured)
  const totalProfiles     = players.length + coaches.length + clubs.length + agents.length
  const roleDistribution  = {
    player: users.filter(u => u.role === 'player').length,
    coach:  users.filter(u => u.role === 'coach').length,
    club:   users.filter(u => u.role === 'club').length,
    agent:  users.filter(u => u.role === 'agent').length,
  }
  const playerNames = Object.fromEntries(players.map(p => [p.uid, p.fullName]))
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

      {/* Reject Modal — con campo de motivo */}
      <RejectModal
        open={rejectTarget !== null}
        profileName={rejectTarget?.fullName ?? rejectTarget?.name ?? ''}
        onConfirm={handleRejectWithReason}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Toast stack */}
      <ToastStack toasts={toasts} onRemove={removeToast} />

      {/* Sidebar */}
      <AdminSidebar
        tab={tab}
        onTab={(t) => { setTab(t); setMobileSidebarOpen(false) }}
        pendingCount={pending.length}
        isSuperAdmin={isSuperAdmin}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main — shifts with sidebar via the spacer inside AdminSidebar */}
      <main className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          user={user}
          photoURL={firebaseUser?.photoURL}
          pendingCount={pending.length}
          density={density}
          role={user?.systemRole}
          onDensityToggle={toggleDensity}
          onViewSite={() => window.open('/', '_blank')}
          onOpenPalette={() => setPaletteOpen(true)}
          onViewPending={() => setTab('solicitudes')}
          onMobileMenu={() => setMobileSidebarOpen(o => !o)}
        />

        <div className="flex-1 px-4 md:px-7 pb-12 pt-6 space-y-6">
          {loadError && (
            <div className="rounded-xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.07)] px-5 py-3 text-sm text-[rgba(245,200,80,0.95)] flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              <span className="flex-1">{loadError}</span>
              <button onClick={() => window.location.reload()} className="shrink-0 rounded-[6px] border border-[rgba(245,200,80,0.3)] bg-transparent px-3 py-1 text-[12px] cursor-pointer font-sans text-[rgba(245,200,80,0.95)] hover:bg-[rgba(245,200,80,0.1)]">Recargar</button>
            </div>
          )}

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <>
              <AdminStats totalUsers={users.length} totalProfiles={totalProfiles} published={publishedPlayers.length} pending={pending.length} videos={videos.length} roleDistribution={roleDistribution} deltas={metrics.deltas} />
              <AdminCharts roleDistribution={roleDistribution} totalUsers={users.length} months={metrics.months} roleSeries={metrics.roleSeries} pendingSeries={metrics.pendingSeries} monthRange={monthRange} onMonthRangeChange={setMonthRange} />
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <AdminPendingTable items={pending.slice(0,6)} onApprove={i => handleStatus(i,'published')} onReject={confirmReject} onViewAll={() => setTab('solicitudes')} compact density={density} />
                <AdminActivity onViewAll={() => setTab('solicitudes')} />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <AdminVideos videos={videos.slice(0,3)} playerNames={playerNames} onToggle={handleToggleVideo} onRemove={confirmRemoveVideo} onViewAll={() => setTab('videos')} compact />
                <AdminQuickActions onTab={setTab} toast={toast} />
              </div>
            </>
          )}

          {/* SOLICITUDES */}
          {tab === 'solicitudes' && (
            <AdminPendingTable items={pending} onApprove={i => handleStatus(i,'published')} onReject={confirmReject} onView={item => {
              const colToRoute: Record<string, string> = { players:'players', coaches:'coaches', clubs:'clubs', agents:'agents' }
              window.open(`/${colToRoute[item._col] ?? item._col}/${item.uid}`, '_blank')
            }} density={density} />
          )}

          {/* PERFILES */}
          {tab === 'perfiles' && (
            <AdminProfilesTab
              players={players}
              coaches={coaches}
              clubs={clubs}
              agents={agents}
              onChangeStatus={handleChangeStatus}
              onFeatured={handleFeatured}
              onRequestReject={handleRequestRejectFromProfiles}
              onRefresh={() => setRefreshKey(k => k + 1)}
            />
          )}

          {/* USUARIOS */}
          {tab === 'usuarios' && (() => {
            const q = userSearch.toLowerCase().trim()
            const filteredUsers = users.filter(u => {
              const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter || u.systemRole === userRoleFilter
              const matchSearch = !q || (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q)
              return matchRole && matchSearch
            })
            return (
              <div className="space-y-4">
                <SectionHeader title="Gestión de usuarios" subtitle={`${users.length} usuarios registrados`} />
                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(255,255,255,0.25)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
                    <input
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Buscar por nombre o email…"
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-4 py-2.5 text-[14px] text-white placeholder:text-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(170,255,0,0.4)] focus:bg-[rgba(170,255,0,0.03)] transition-all"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(['all','player','coach','club','agent','admin','super_admin'] as const).map(f => (
                      <button key={f} onClick={() => setUserRoleFilter(f)}
                        className="text-[12px] px-3 py-2 rounded-lg border transition-all cursor-pointer"
                        style={{
                          background:  userRoleFilter === f ? 'rgba(170,255,0,0.1)' : 'rgba(255,255,255,0.04)',
                          color:       userRoleFilter === f ? '#AAFF00' : 'rgba(255,255,255,0.4)',
                          borderColor: userRoleFilter === f ? 'rgba(170,255,0,0.3)' : 'rgba(255,255,255,0.08)',
                        }}>
                        {f === 'all' ? 'Todos' : f === 'super_admin' ? 'Super Admin' : f === 'admin' ? 'Admin' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.07)]">
                        {['Usuario','Rol','Sistema','Acciones'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[11px] font-bold shrink-0">
                                {((u.name || u.email)?.[0] ?? '?').toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{u.name || '—'}</p>
                                <p className="text-[12px] text-[rgba(255,255,255,0.3)]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                          <td className="px-5 py-3">
                            <span className="text-[12px] px-2 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]">{u.systemRole ?? 'user'}</span>
                          </td>
                          <td className="px-5 py-3">
                            {isSuperAdmin && (
                              <div className="flex gap-1.5">
                                {(['user','admin','super_admin'] as const).map(role => (
                                  <button key={role} onClick={() => handleSetSystemRole(u.uid, role)}
                                    className="text-[11px] px-2 py-1 rounded-md cursor-pointer font-sans border-none transition-all"
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
                  </div>
                  {filteredUsers.length === 0 && (
                    <div className="py-16 text-center text-[rgba(255,255,255,0.2)] text-sm">
                      {userSearch || userRoleFilter !== 'all' ? 'Sin resultados para los filtros aplicados.' : 'No hay usuarios registrados.'}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* VIDEOS */}
          {tab === 'videos' && (
            <AdminVideos videos={videos} playerNames={playerNames} onToggle={handleToggleVideo} onRemove={confirmRemoveVideo} />
          )}

          {/* ESTADÍSTICAS */}
          {tab === 'estadisticas' && (
            <div className="space-y-6">
              <SectionHeader title="Estadísticas de la plataforma" subtitle="Métricas y distribución de perfiles" />
              <AdminStats totalUsers={users.length} totalProfiles={totalProfiles} published={publishedPlayers.length} pending={pending.length} videos={videos.length} roleDistribution={roleDistribution} deltas={metrics.deltas} />
              <AdminCharts roleDistribution={roleDistribution} totalUsers={users.length} months={metrics.months} roleSeries={metrics.roleSeries} pendingSeries={metrics.pendingSeries} monthRange={monthRange} onMonthRangeChange={setMonthRange} />
            </div>
          )}

          {/* CONFIGURACIÓN */}
          {tab === 'configuracion' && (
            isSuperAdmin
              ? <AdminConfigPanel toast={toast} users={users} players={players} />
              : (
                <div className="space-y-4">
                  <SectionHeader title="Configuración del sitio" subtitle="Acceso restringido" />
                  <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(255,60,60,0.08)] border border-[rgba(255,60,60,0.2)] flex items-center justify-center">
                      <svg className="w-6 h-6 text-[rgba(255,100,100,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <p className="text-[rgba(255,255,255,0.3)] text-sm">Requiere permisos de Super Admin.</p>
                  </div>
                </div>
              )
          )}

          {/* SUSCRIPCIONES */}
          {tab === 'suscripciones' && <AdminSubscriptionsTab />}

          {/* MODERACIÓN — placeholder */}
          {tab === 'moderacion' && (
            <div className="space-y-4">
              <SectionHeader title="Moderación" subtitle="Próximamente disponible" />
              <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.2)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[rgba(170,255,0,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </div>
                <p className="text-[rgba(255,255,255,0.3)] text-sm">Esta sección está en desarrollo.</p>
              </div>
            </div>
          )}
        </div>

        <footer className="px-7 py-5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[12px] text-[rgba(255,255,255,0.2)]">
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
  return <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color:s.color, background:s.bg }}>{s.label}</span>
}
