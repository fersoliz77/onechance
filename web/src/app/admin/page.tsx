'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import StatTile from '@/components/ui/StatTile'
import EmptyState from '@/components/ui/EmptyState'
import { getPendingProfiles, getAllPlayers, getAllUsers } from '@/lib/firestore'
import { getAllVideos } from '@/lib/rtdb'
import type { PlayerProfile, VideoEntry, ProfileStatus, UserRecord } from '@/types'
import { type DocumentData } from 'firebase/firestore'
import { isAdminRole, isSuperAdminRole } from '@/lib/permissions'

type PendingItem = DocumentData & { _col: string }

function PendingCard({ item, onApprove, onReject }: { item: PendingItem; onApprove: () => void; onReject: () => void }) {
  const colLabel: Record<string, string> = { players:'Jugador', coaches:'Técnico', clubs:'Club', agents:'Representante' }
  const name = item.fullName ?? item.name ?? 'Sin nombre'
  return (
    <div className="flex items-center gap-3 lg:gap-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 lg:py-3.5">
      <div>
        <div className="text-white text-[14px] lg:text-[15px] font-medium">{name}</div>
        <div className="text-[rgba(255,255,255,0.3)] text-[11px]">{colLabel[item._col] ?? item._col} · {item.nationality ?? item.country ?? ''}</div>
      </div>
      {item.isMinor && <span className="text-[9px] px-2 py-0.5 rounded-[7px] bg-[rgba(255,180,0,0.16)] text-[rgba(255,180,0,0.95)] border border-[rgba(255,180,0,0.3)]">MENOR</span>}
      <div className="ml-auto flex gap-2">
        <button onClick={onApprove}
          className="text-[11px] lg:text-[12px] px-3 py-1.5 rounded-[7px] cursor-pointer font-sans border-none"
          style={{ background: 'rgba(0,200,83,0.12)', color: '#00C853' }}>
          Aprobar
        </button>
        <button onClick={onReject}
          className="text-[11px] lg:text-[12px] px-3 py-1.5 rounded-[7px] cursor-pointer font-sans border-none"
          style={{ background: 'rgba(255,60,60,0.1)', color: '#FF6060' }}>
          Rechazar
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'pending' | 'users' | 'videos' | 'featured' | 'platform'>('overview')
  const [pending, setPending] = useState<PendingItem[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [videos, setVideos] = useState<(VideoEntry & { playerUid: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [savingRoleUid] = useState('')
  const [loadError, setLoadError] = useState('')

  const isAdmin = isAdminRole(user?.systemRole)
  const isSuperAdmin = isSuperAdminRole(user?.systemRole)

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/')
  }, [user, authLoading, isAdmin, router])

  useEffect(() => {
    if (!user || !isAdmin) return
    Promise.allSettled([getPendingProfiles(), getAllPlayers(), getAllVideos(), getAllUsers()]).then((results) => {
      const [p, pl, v, u] = results
      if (p.status === 'fulfilled') setPending(p.value)
      if (pl.status === 'fulfilled') setPlayers(pl.value)
      if (v.status === 'fulfilled') setVideos(v.value)
      if (u.status === 'fulfilled') setUsers(u.value)

      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        setLoadError('No se pudieron cargar algunos datos del panel admin. Verificá permisos de rol y userRoles en RTDB.')
      } else {
        setLoadError('')
      }
      setLoading(false)
    })
  }, [user, isAdmin])

  const callAdminApi = async (path: string, payload: Record<string, unknown>) => {
    if (!firebaseUser) throw new Error('No auth user')
    const token = await firebaseUser.getIdToken()
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? 'Admin action failed')
    }
  }

  const handleStatus = async (item: PendingItem, status: ProfileStatus) => {
    await callAdminApi('/api/admin/profile-status', { collection: item._col, uid: item.uid, status })
    setPending(ps => ps.filter(p => p.uid !== item.uid))
  }

  const handleFeatured = async (uid: string, current: boolean) => {
    await callAdminApi('/api/admin/featured', { uid, isFeatured: !current })
    setPlayers(ps => ps.map(p => p.uid === uid ? { ...p, isFeatured: !current } : p))
  }

  const handleRemoveVideo = async (playerUid: string, id: string) => {
    await callAdminApi('/api/admin/video', { playerUid, videoId: id, action: 'delete' })
    setVideos(vs => vs.filter(v => !(v.playerUid === playerUid && v.id === id)))
  }

  const handleToggleVideo = async (v: VideoEntry & { playerUid: string }) => {
    const next = v.status === 'active' ? 'hidden' : 'active'
    await callAdminApi('/api/admin/video', { playerUid: v.playerUid, videoId: v.id, action: 'toggle', status: next })
    setVideos(vs => vs.map(x => x.id === v.id && x.playerUid === v.playerUid ? { ...x, status: next } : x))
  }

  const handleSetSystemRole = async (uid: string, systemRole: 'user' | 'admin' | 'super_admin') => {
    await callAdminApi('/api/admin/system-role', { uid, systemRole })
    setUsers(us => us.map(u => u.uid === uid ? { ...u, systemRole } : u))
  }

  if (authLoading || loading) {
    return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  }

  if (!user || !isAdmin) return null

  const publishedPlayers = players.filter(p => p.status === 'published')
  const roleDistribution = {
    player: users.filter(u => u.role === 'player').length,
    coach: users.filter(u => u.role === 'coach').length,
    club: users.filter(u => u.role === 'club').length,
    agent: users.filter(u => u.role === 'agent').length,
  }
  const totalUsers = users.length
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-detail oc-page-block">
          {/* Header */}
          <div className="mb-7 lg:mb-8">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(255,180,0,0.09)] border border-[rgba(255,180,0,0.24)] rounded-[20px] px-3 py-1 mb-3">
              <div className="w-[5px] h-[5px] bg-oc-yellow rounded-full animate-blink" />
              <span className="text-[rgba(255,180,0,0.95)] text-[9px] lg:text-[10px] tracking-[0.07em]">PANEL ADMINISTRADOR</span>
            </div>
            <h1 className="text-white text-[30px] lg:text-[38px] font-medium tracking-[-0.03em]">Admin · OneChance</h1>
          </div>

          <div className="grid lg:grid-cols-[230px_1fr] gap-4 lg:gap-6 items-start">
            <aside className="w-full lg:w-[230px] shrink-0">
              <div className="bg-[rgba(255,180,0,0.04)] border border-[rgba(255,180,0,0.15)] rounded-[10px] px-3 py-2 mb-3 text-[rgba(255,180,0,0.8)] text-[11px]">🔐 Panel de administración</div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] overflow-hidden">
                {[
                  ['overview', '◈', 'Resumen'],
                  ['pending', '⏳', `Pendientes (${pending.length})`],
                  ['users', '◉', 'Usuarios'],
                  ['videos', '▶', 'Videos'],
                  ['featured', '★', 'Destacados'],
                  ...(isSuperAdmin ? [['platform', '⚙', 'Plataforma']] : []),
                ].map(([id, icon, label]) => (
                  <button key={id} onClick={() => setTab(id as typeof tab)} className="w-full h-[46px] lg:h-[50px] px-3.5 lg:px-4 border-none border-b border-[rgba(255,255,255,0.04)] bg-transparent cursor-pointer flex items-center gap-2.5 text-left" style={{ background: tab === id ? 'rgba(255,180,0,0.1)' : 'transparent', boxShadow: tab === id ? 'inset 2px 0 0 #FFB400' : 'none' }}>
                    <span className="text-[13px]" style={{ color: tab === id ? '#FFB400' : 'rgba(255,255,255,0.25)' }}>{icon}</span>
                    <span className="text-[13px]" style={{ color: tab === id ? '#fff' : 'rgba(255,255,255,0.42)' }}>{label}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="min-w-0 flex flex-col gap-4">
          {loadError && (
            <div className="rounded-[10px] border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.08)] px-4 py-3 text-[12px] text-[rgba(255,210,120,0.95)]">
              {loadError}
            </div>
          )}
          {tab === 'overview' && (
            <div>
              <div className="grid md:grid-cols-2 gap-3 lg:gap-4 mb-4">
                <StatTile label="Usuarios totales" value={totalUsers} color="#00C853" />
                <StatTile label="Perfiles publicados" value={publishedPlayers.length} color="#00C853" />
                <StatTile label="Pendientes" value={pending.length} color="#FFB400" />
                <StatTile label="Videos activos" value={videos.length} color="#5A8FFF" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4">
                <div className="text-white text-[14px] lg:text-[15px] mb-3">Distribución por rol</div>
                {[
                  ['Jugadores', `${roleDistribution.player}`, totalUsers > 0 ? `${Math.round((roleDistribution.player / totalUsers) * 100)}%` : '0%', '#00C853'],
                  ['Técnicos', `${roleDistribution.coach}`, totalUsers > 0 ? `${Math.round((roleDistribution.coach / totalUsers) * 100)}%` : '0%', '#5A8FFF'],
                  ['Clubes', `${roleDistribution.club}`, totalUsers > 0 ? `${Math.round((roleDistribution.club / totalUsers) * 100)}%` : '0%', '#FFB400'],
                  ['Representantes', `${roleDistribution.agent}`, totalUsers > 0 ? `${Math.round((roleDistribution.agent / totalUsers) * 100)}%` : '0%', '#B464FF'],
                ].map(([l,n,pct,c]) => (
                  <div key={l} className="mb-3">
                    <div className="flex justify-between text-[12px] mb-1"><span className="text-[rgba(255,255,255,0.5)]">{l}</span><span className="text-[rgba(255,255,255,0.3)]">{n}</span></div>
                    <div className="h-[4px] rounded bg-[rgba(255,255,255,0.06)]"><div className="h-full rounded" style={{ width: pct, background: c as string }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'pending' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Perfiles pendientes de aprobación</div>
              {pending.length === 0 ? (
                <EmptyState message="No hay perfiles pendientes. ✓" className="py-12" />
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((item, i) => (
                    <PendingCard key={`${item._col}-${item.uid ?? i}`} item={item}
                      onApprove={() => handleStatus(item, 'published')}
                      onReject={() => handleStatus(item, 'rejected')} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Usuarios</div>
              {users.length === 0 ? (
                <EmptyState message="No hay usuarios registrados." className="py-12" />
              ) : (
                <div className="flex flex-col gap-2">
                  {users.map(u => (
                      <div key={u.uid} className="flex items-center gap-3 lg:gap-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 lg:py-3.5">
                        <div className="flex-1">
                          <div className="text-white text-[14px] lg:text-[15px] font-medium">{u.name || u.email}</div>
                          <div className="text-[rgba(255,255,255,0.3)] text-[11px]">{u.email} · {u.role}</div>
                        </div>
                      <div className="text-[9px] px-2.5 py-1 rounded-[6px] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)]">
                        {u.systemRole ?? 'user'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'videos' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Todos los videos</div>
              {videos.length === 0 ? (
                <EmptyState message="No hay videos subidos." className="py-12" />
              ) : (
                <div className="flex flex-col gap-2">
                  {videos.map(v => (
                    <div key={`${v.playerUid}-${v.id}`} className="flex items-center gap-3 lg:gap-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 lg:py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[13px] lg:text-[14px] truncate">{v.title}</div>
                        <div className="text-[rgba(255,255,255,0.2)] text-[10px] truncate">{v.url ?? '—'}</div>
                        <div className="text-[rgba(255,255,255,0.15)] text-[10px]">Jugador: {v.playerUid}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleToggleVideo(v)}
                          className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none"
                          style={{ background: v.status === 'active' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)', color: v.status === 'active' ? '#00C853' : 'rgba(255,255,255,0.3)' }}>
                          {v.status === 'active' ? 'Visible' : 'Oculto'}
                        </button>
                        <button onClick={() => handleRemoveVideo(v.playerUid, v.id)}
                          className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none"
                          style={{ background: 'rgba(255,60,60,0.1)', color: '#FF6060' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'featured' && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Gestión de destacados</div>
              <div className="flex flex-col gap-2">
                {players.filter(p => p.status === 'published').map(p => (
                    <div key={p.uid} className="flex items-center gap-3 lg:gap-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 lg:py-3.5">
                      <div className="flex-1">
                        <div className="text-white text-[14px] lg:text-[15px] font-medium">{p.fullName}</div>
                        <div className="text-[rgba(255,255,255,0.3)] text-[11px]">{p.position} · {p.nationality}</div>
                      </div>
                    <button onClick={() => handleFeatured(p.uid, p.isFeatured)} className="text-[9px] px-2.5 py-1 rounded-[6px] cursor-pointer font-sans border-none transition-all" style={{ background: p.isFeatured ? 'rgba(0,200,83,0.14)' : 'rgba(255,255,255,0.06)', color: p.isFeatured ? '#00C853' : 'rgba(255,255,255,0.4)' }}>
                      {p.isFeatured ? '★ Destacado' : '☆ Destacar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'platform' && isSuperAdmin && (
            <div>
              <div className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] mb-3">Configuración de plataforma</div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4 mb-3">
                <div className="text-white text-[14px] lg:text-[15px] mb-2">Acceso super admin habilitado</div>
                <div className="text-[rgba(255,255,255,0.4)] text-[12px]">Este rol puede aprobar, rechazar, eliminar, moderar y administrar permisos.</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4">
                <div className="text-white text-[14px] lg:text-[15px] mb-3">Gobernanza de admins</div>
                <div className="text-[rgba(255,255,255,0.38)] text-[12px] leading-[1.7] mb-3">
                  Asignación operativa de roles administrativos. Los cambios quedan auditados y actualizan claims del usuario.
                </div>
                <div className="flex flex-col gap-2">
                  {users.slice(0, 8).map(u => (
                    <div key={u.uid} className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] rounded-[8px] px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[11px] truncate">{u.name || u.email}</div>
                        <div className="text-[rgba(255,255,255,0.3)] text-[9px] truncate">{u.email}</div>
                      </div>
                      <button onClick={() => handleSetSystemRole(u.uid, 'user')} className="text-[9px] px-2 py-1 rounded-[6px] bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] border-none cursor-pointer">user</button>
                      <button onClick={() => handleSetSystemRole(u.uid, 'admin')} className="text-[9px] px-2 py-1 rounded-[6px] bg-[rgba(255,180,0,0.18)] text-[rgba(255,180,0,0.95)] border-none cursor-pointer">admin</button>
                      <button onClick={() => handleSetSystemRole(u.uid, 'super_admin')} className="text-[9px] px-2 py-1 rounded-[6px] bg-[rgba(255,60,60,0.18)] text-[rgba(255,120,120,0.95)] border-none cursor-pointer">super</button>
                    </div>
                  ))}
                </div>
                {savingRoleUid && <div className="text-[rgba(255,180,0,0.85)] text-[10px] mt-2">Actualizando rol: {savingRoleUid}</div>}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
