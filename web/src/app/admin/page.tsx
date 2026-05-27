'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import { getPendingProfiles, getAllUsers } from '@/lib/firestore'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, VideoEntry, ProfileStatus, UserRecord } from '@/types'
import { isAdminRole, isSuperAdminRole } from '@/lib/permissions'
import { logAudit, type AuditAction } from '@/lib/auditLog'
import { useToastState } from '@/hooks/useToast'
import { useRateLimit } from '@/hooks/useRateLimit'
import { buildAdminMetrics } from '@/lib/adminMetrics'

import { subscribeAdminInbox } from '@/lib/rtdb'
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
import AdminMessagesTab from '@/components/admin/AdminMessagesTab'
import AdminReportsTab from '@/components/admin/AdminReportsTab'
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
export type AdminTab = 'dashboard' | 'perfiles' | 'usuarios' | 'solicitudes' | 'videos' | 'visitas' | 'estadisticas' | 'configuracion' | 'moderacion' | 'suscripciones'
type MonthRange = 3 | 6 | 12

type VisitMetricRow = {
  uid: string
  visits: number
  visitsInternal: number
  visitsExternal: number
  lastVisitedAt: string | null
}

type VisitorRow = {
  uid: string
  name: string | null
  email: string | null
  role: string | null
  systemRole: string | null
  count: number
  lastVisitedAt: string | null
}

type VisitTopRow = {
  uid: string
  total: number
  internal: number
  external: number
}

type VisitTopRange = 7 | 14 | 30

const VISIT_TOP_RANGE_STORAGE_KEY = 'oc-admin-visits-top-range'
const VISIT_PAGE_SIZE_STORAGE_KEY = 'oc-admin-visits-page-size'

function getStoredVisitTopRange(): VisitTopRange {
  if (typeof window === 'undefined') return 7
  const raw = window.localStorage.getItem(VISIT_TOP_RANGE_STORAGE_KEY)
  if (raw === '14') return 14
  if (raw === '30') return 30
  return 7
}

function getStoredVisitPageSize(): number {
  if (typeof window === 'undefined') return 10
  const raw = window.localStorage.getItem(VISIT_PAGE_SIZE_STORAGE_KEY)
  if (raw === '20') return 20
  if (raw === '50') return 50
  return 10
}

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
  const [loadingVisits, setLoadingVisits] = useState(false)
  const [pendingMessagesCount, setPendingMessagesCount] = useState(0)
  const [loadingVisitors, setLoadingVisitors] = useState(false)
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
  const [visitMetrics, setVisitMetrics] = useState<VisitMetricRow[]>([])
  const [visitSearch, setVisitSearch] = useState('')
  const [selectedVisitUid, setSelectedVisitUid] = useState<string | null>(null)
  const [selectedVisitors, setSelectedVisitors] = useState<VisitorRow[]>([])
  const [topVisits7d, setTopVisits7d] = useState<VisitTopRow[]>([])
  const [visitTopRange, setVisitTopRange] = useState<VisitTopRange>(getStoredVisitTopRange)
  const [visitPage, setVisitPage] = useState(1)
  const [visitPageSize, setVisitPageSize] = useState(getStoredVisitPageSize)

  const { toasts, toast, remove: removeToast } = useToastState()
  const { execute } = useRateLimit(2000)
  const metrics = useMemo(() => buildAdminMetrics(users, videos, pending, monthRange), [users, videos, pending, monthRange])

  const isAdmin      = isAdminRole(user?.systemRole)
  const isSuperAdmin = isSuperAdminRole(user?.systemRole)

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/')
  }, [user, authLoading, isAdmin, router])

  // Admin inbox badge — realtime RTDB subscription
  useEffect(() => {
    if (!user || !isAdmin) return
    const unsub = subscribeAdminInbox(count => setPendingMessagesCount(count))
    return unsub
  }, [user, isAdmin])

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
    const cacheKey = `perfiles:${refreshKey}`
    if (loadedRef.current.has(cacheKey)) return
    loadedRef.current.add(cacheKey)
    const load = async () => {
      try {
        if (!firebaseUser) return
        const token = await firebaseUser.getIdToken()
        const res = await fetch('/api/admin/profiles', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load profiles')
        const body = await res.json() as {
          players?: PlayerProfile[]
          coaches?: CoachProfile[]
          clubs?: ClubProfile[]
          agents?: AgentProfile[]
        }
        setPlayers(Array.isArray(body.players) ? body.players : [])
        setCoaches(Array.isArray(body.coaches) ? body.coaches : [])
        setClubs(Array.isArray(body.clubs) ? body.clubs : [])
        setAgents(Array.isArray(body.agents) ? body.agents : [])
      } catch (err) {
        console.error('[Admin] loadProfiles failed:', err)
        toast.error('No se pudieron cargar todos los perfiles')
      } finally {
      }
    }
    load()
  }, [user, isAdmin, tab, firebaseUser, toast, refreshKey])

  // Carga lazy: metricas de visitas solo cuando se abre la pestaña "visitas"
  useEffect(() => {
    if (!user || !isAdmin || tab !== 'visitas') return
    if (loadedRef.current.has('visitas')) return
    loadedRef.current.add('visitas')
    setLoadingVisits(true)

    const load = async () => {
      try {
        if (!firebaseUser) return
        const token = await firebaseUser.getIdToken()
        const res = await fetch('/api/admin/profile-visits-summary', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('No se pudieron cargar métricas de visitas')
        const body = await res.json() as { items?: VisitMetricRow[] }
        setVisitMetrics(Array.isArray(body.items) ? body.items : [])

      } catch (err) {
        console.error('[Admin] profile visits load failed:', err)
      } finally {
        setLoadingVisits(false)
      }
    }

    load()
  }, [user, isAdmin, tab, firebaseUser])

  useEffect(() => {
    if (!user || !isAdmin || tab !== 'visitas' || !firebaseUser) return
    const loadTop = async () => {
      try {
        const token = await firebaseUser.getIdToken()
        const topRes = await fetch(`/api/admin/profile-visits-top7d?days=${visitTopRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!topRes.ok) throw new Error('No se pudo cargar top de visitas')
        const topBody = await topRes.json() as { items?: VisitTopRow[] }
        setTopVisits7d(Array.isArray(topBody.items) ? topBody.items : [])
      } catch (err) {
        console.error('[Admin] profile visits top load failed:', err)
        setTopVisits7d([])
      }
    }
    loadTop()
  }, [user, isAdmin, tab, firebaseUser, visitTopRange])

  useEffect(() => {
    window.localStorage.setItem(VISIT_TOP_RANGE_STORAGE_KEY, String(visitTopRange))
  }, [visitTopRange])

  useEffect(() => {
    window.localStorage.setItem(VISIT_PAGE_SIZE_STORAGE_KEY, String(visitPageSize))
  }, [visitPageSize])

  // Carga lazy: videos solo cuando se abre la pestaña "videos"
  useEffect(() => {
    if (!user || !isAdmin || tab !== 'videos') return
    if (loadedRef.current.has('videos')) return
    loadedRef.current.add('videos')
    const load = async () => {
      try {
        if (!firebaseUser) return
        const token = await firebaseUser.getIdToken()
        const res = await fetch('/api/admin/video', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load videos')
        const body = await res.json() as { items?: (VideoEntry & { playerUid: string })[] }
        setVideos(Array.isArray(body.items) ? body.items : [])
      } catch (err) {
        console.error('[Admin] getAllVideos failed:', err)
      } finally {
      }
    }
    load()
  }, [user, isAdmin, tab, firebaseUser])

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

  const callAdminApiJson = useCallback(async <T,>(path: string, payload?: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') => {
    if (!firebaseUser) throw new Error('No auth user')
    const exec = async (forceRefresh = false) => {
      const token = await firebaseUser.getIdToken(forceRefresh)
      return fetch(path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(method === 'POST' ? { body: JSON.stringify(payload ?? {}) } : {}),
      })
    }

    let res = await exec(false)
    if (res.status === 401) res = await exec(true)
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(body.error ?? `Error HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
  }, [firebaseUser])

  const loadProfileVisitors = useCallback(async (profileUid: string) => {
    setSelectedVisitUid(profileUid)
    setLoadingVisitors(true)
    try {
      const body = await callAdminApiJson<{ items?: VisitorRow[] }>('/api/admin/profile-visitors', { profileUid })
      setSelectedVisitors(Array.isArray(body.items) ? body.items : [])
    } catch (err) {
      console.error('[Admin] profile visitors load failed:', err)
      toast.error('No se pudo cargar el detalle de visitantes')
      setSelectedVisitors([])
    } finally {
      setLoadingVisitors(false)
    }
  }, [callAdminApiJson, toast])

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
      const next: VideoEntry['status'] = v.status === 'pending' ? 'published' : v.status === 'published' ? 'hidden' : 'published'
      try {
        await callAdminApi('/api/admin/video', { playerUid: v.playerUid, videoId: v.id, action: 'toggle', status: next })
        setVideos(vs => vs.map(x => x.id === v.id && x.playerUid === v.playerUid ? { ...x, status: next } : x))
        await logAudit({ uid: firebaseUser!.uid, email: firebaseUser!.email }, 'toggle_video', v.id, 'video', { status: next })
        toast.info(next === 'published' ? 'Video publicado' : 'Video ocultado')
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
  const totalProfiles     = players.length + coaches.length + clubs.length + agents.length
  const roleDistribution  = {
    player: users.filter(u => u.role === 'player').length,
    coach:  users.filter(u => u.role === 'coach').length,
    club:   users.filter(u => u.role === 'club').length,
    agent:  users.filter(u => u.role === 'agent').length,
  }
  const playerNames = Object.fromEntries(players.map(p => [p.uid, p.fullName]))
  const usersByUid = Object.fromEntries(users.map(u => [u.uid, u]))
  const totalVisits = visitMetrics.reduce((acc, item) => acc + item.visits, 0)
  const totalInternalVisits = visitMetrics.reduce((acc, item) => acc + item.visitsInternal, 0)
  const totalExternalVisits = visitMetrics.reduce((acc, item) => acc + item.visitsExternal, 0)
  const visitQuery = visitSearch.toLowerCase().trim()
  const filteredVisitMetrics = visitMetrics
    .filter(item => {
      const owner = usersByUid[item.uid]
      const name = (owner?.name ?? '').toLowerCase()
      const email = (owner?.email ?? '').toLowerCase()
      return !visitQuery || item.uid.toLowerCase().includes(visitQuery) || name.includes(visitQuery) || email.includes(visitQuery)
    })
    .sort((a, b) => b.visits - a.visits)
  const totalVisitPages = Math.max(1, Math.ceil(filteredVisitMetrics.length / visitPageSize))
  const safeVisitPage = Math.min(visitPage, totalVisitPages)
  const pagedVisitMetrics = filteredVisitMetrics.slice((safeVisitPage - 1) * visitPageSize, safeVisitPage * visitPageSize)
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
        pendingMessagesCount={pendingMessagesCount}
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
              const colToRoute: Record<string, string> = { players:'jugadores', coaches:'tecnicos', clubs:'clubes', agents:'representantes' }
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

          {/* VISITAS */}
          {tab === 'visitas' && (
            <div className="space-y-5">
              <SectionHeader title="Analytics de visitas" subtitle="Totales por perfil y detalle de visitantes internos" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <KpiCard label="Visitas totales" value={totalVisits.toLocaleString('es-AR')} />
                <KpiCard label="Visitas internas" value={totalInternalVisits.toLocaleString('es-AR')} />
                <KpiCard label="Visitas externas" value={totalExternalVisits.toLocaleString('es-AR')} />
              </div>

              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between gap-3">
                  <p className="text-white font-semibold">Top 10 perfiles más visitados (últimos {visitTopRange} días)</p>
                  <div className="flex items-center gap-1.5">
                    {([7, 14, 30] as const).map(days => (
                      <button
                        key={days}
                        onClick={() => setVisitTopRange(days)}
                        className="text-[11px] px-2.5 py-1 rounded-md border cursor-pointer"
                        style={{
                          background: visitTopRange === days ? 'rgba(170,255,0,0.12)' : 'rgba(255,255,255,0.04)',
                          color: visitTopRange === days ? '#AAFF00' : 'rgba(255,255,255,0.55)',
                          borderColor: visitTopRange === days ? 'rgba(170,255,0,0.3)' : 'rgba(255,255,255,0.14)',
                        }}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.07)]">
                        {['#','Perfil','Rol','Total 7d','Internas','Externas'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topVisits7d.map((item, idx) => {
                        const owner = usersByUid[item.uid]
                        return (
                          <tr key={item.uid} className="border-b border-[rgba(255,255,255,0.05)]">
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.55)]">{idx + 1}</td>
                            <td className="px-5 py-3">
                              <p className="text-white font-medium">{owner?.name || 'Perfil sin nombre'}</p>
                              <p className="text-[12px] text-[rgba(255,255,255,0.3)]">{owner?.email || item.uid}</p>
                            </td>
                            <td className="px-5 py-3"><RoleBadge role={owner?.role} /></td>
                            <td className="px-5 py-3 text-white font-semibold">{item.total.toLocaleString('es-AR')}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.75)]">{item.internal.toLocaleString('es-AR')}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.75)]">{item.external.toLocaleString('es-AR')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {topVisits7d.length === 0 && <div className="py-10 text-center text-[rgba(255,255,255,0.25)]">Aún no hay datos de los últimos 7 días.</div>}
              </div>

              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="relative max-w-[420px]">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(255,255,255,0.25)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
                  <input
                    value={visitSearch}
                    onChange={e => setVisitSearch(e.target.value)}
                    placeholder="Buscar por nombre, email o UID"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-4 py-2.5 text-[14px] text-white placeholder:text-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(170,255,0,0.4)]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.07)]">
                        {['Perfil','Rol','Total','Internas','Externas','Última visita','Detalle'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!loadingVisits && pagedVisitMetrics.map(item => {
                        const owner = usersByUid[item.uid]
                        return (
                          <tr key={item.uid} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
                            <td className="px-5 py-3">
                              <div>
                                <p className="text-white font-medium">{owner?.name || 'Perfil sin nombre'}</p>
                                <p className="text-[12px] text-[rgba(255,255,255,0.3)]">{owner?.email || item.uid}</p>
                              </div>
                            </td>
                            <td className="px-5 py-3"><RoleBadge role={owner?.role} /></td>
                            <td className="px-5 py-3 text-white font-semibold">{item.visits.toLocaleString('es-AR')}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.75)]">{item.visitsInternal.toLocaleString('es-AR')}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.75)]">{item.visitsExternal.toLocaleString('es-AR')}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.45)]">{item.lastVisitedAt ? new Date(item.lastVisitedAt).toLocaleString('es-AR') : '—'}</td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => loadProfileVisitors(item.uid)}
                                className="text-[12px] px-2.5 py-1 rounded-md bg-[rgba(170,255,0,0.12)] text-[#AAFF00] border border-[rgba(170,255,0,0.3)] cursor-pointer"
                              >
                                Ver visitantes
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.07)] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[12px] text-[rgba(255,255,255,0.35)]">
                    Mostrando {filteredVisitMetrics.length === 0 ? 0 : (safeVisitPage - 1) * visitPageSize + 1} - {Math.min(safeVisitPage * visitPageSize, filteredVisitMetrics.length)} de {filteredVisitMetrics.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={visitPageSize}
                      onChange={(e) => setVisitPageSize(Number(e.target.value))}
                      className="rounded-md border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-[12px] text-white"
                    >
                      {[10, 20, 50].map(size => <option key={size} value={size}>/{size}</option>)}
                    </select>
                    <button
                      onClick={() => setVisitPage(p => Math.max(1, p - 1))}
                      disabled={safeVisitPage <= 1}
                      className="text-[12px] px-2.5 py-1.5 rounded border border-[rgba(255,255,255,0.16)] text-[rgba(255,255,255,0.75)] disabled:opacity-40 cursor-pointer"
                    >
                      Anterior
                    </button>
                    <span className="text-[12px] text-[rgba(255,255,255,0.5)]">{safeVisitPage}/{totalVisitPages}</span>
                    <button
                      onClick={() => setVisitPage(p => Math.min(totalVisitPages, p + 1))}
                      disabled={safeVisitPage >= totalVisitPages}
                      className="text-[12px] px-2.5 py-1.5 rounded border border-[rgba(255,255,255,0.16)] text-[rgba(255,255,255,0.75)] disabled:opacity-40 cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
                {loadingVisits && <div className="py-12 text-center text-[rgba(255,255,255,0.3)]">Cargando métricas…</div>}
                {!loadingVisits && filteredVisitMetrics.length === 0 && <div className="py-12 text-center text-[rgba(255,255,255,0.25)]">Sin métricas para mostrar.</div>}
              </div>

              {selectedVisitUid && (
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Visitantes internos del perfil</p>
                      <p className="text-[12px] text-[rgba(255,255,255,0.35)]">UID: {selectedVisitUid}</p>
                    </div>
                    <button onClick={() => { setSelectedVisitUid(null); setSelectedVisitors([]) }} className="text-[12px] px-2 py-1 rounded border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.6)] cursor-pointer">Cerrar</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.07)]">
                          {['Nombre','Email','Rol','Sistema','Visitas','Última visita'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!loadingVisitors && selectedVisitors.map(v => (
                          <tr key={v.uid} className="border-b border-[rgba(255,255,255,0.05)]">
                            <td className="px-5 py-3 text-white">{v.name || 'Usuario interno'}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.7)]">{isSuperAdmin ? (v.email || '—') : 'Solo visible para Super Admin'}</td>
                            <td className="px-5 py-3"><RoleBadge role={v.role ?? undefined} /></td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.7)]">{v.systemRole ?? 'user'}</td>
                            <td className="px-5 py-3 text-white font-semibold">{v.count.toLocaleString('es-AR')}</td>
                            <td className="px-5 py-3 text-[rgba(255,255,255,0.45)]">{v.lastVisitedAt ? new Date(v.lastVisitedAt).toLocaleString('es-AR') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {loadingVisitors && <div className="py-10 text-center text-[rgba(255,255,255,0.3)]">Cargando visitantes…</div>}
                  {!loadingVisitors && selectedVisitors.length === 0 && <div className="py-10 text-center text-[rgba(255,255,255,0.25)]">No hay visitantes internos registrados todavía.</div>}
                </div>
              )}
            </div>
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

          {/* MODERACIÓN — mensajería */}
          {tab === 'moderacion' && (
            <div className="space-y-6">
              <AdminMessagesTab onPendingCountChange={setPendingMessagesCount} />
              <AdminReportsTab />
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

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.35)]">{label}</p>
      <p className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-white">{value}</p>
    </div>
  )
}
