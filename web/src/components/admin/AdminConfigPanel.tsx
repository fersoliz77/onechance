'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { exportToCsv } from '@/lib/exportCsv'
import type { UserRecord, PlayerProfile } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────

type PlatformConfig = {
  general: {
    siteName: string
    maintenanceMode: boolean
    registrationEnabled: boolean
  }
  content: {
    autoApproveProfiles: boolean
    maxVideosPerPlayer: number
    maxFeaturedPlayers: number
    requireEmailVerification: boolean
  }
  notifications: {
    adminEmail: string
    newRequestAlerts: boolean
    weeklySummary: boolean
  }
  features: {
    subscriptionsEnabled: boolean
    messagingEnabled: boolean
    ambassadorsEnabled: boolean
  }
}

const DEFAULT: PlatformConfig = {
  general:       { siteName: 'OneChance', maintenanceMode: false, registrationEnabled: true },
  content:       { autoApproveProfiles: false, maxVideosPerPlayer: 5, maxFeaturedPlayers: 10, requireEmailVerification: false },
  notifications: { adminEmail: '', newRequestAlerts: true, weeklySummary: false },
  features:      { subscriptionsEnabled: false, messagingEnabled: false, ambassadorsEnabled: false },
}

interface ToastAPI {
  success: (m: string) => void
  error: (m: string) => void
  info: (m: string) => void
}

interface Props {
  toast: ToastAPI
  users: UserRecord[]
  players: PlayerProfile[]
}

// ── Primitive UI components ────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className="relative shrink-0 rounded-full border-none transition-colors cursor-pointer"
      style={{
        width: 42, height: 24,
        background: value ? 'rgba(170,255,0,0.22)' : 'rgba(255,255,255,0.09)',
        border: `1px solid ${value ? 'rgba(170,255,0,0.5)' : 'rgba(255,255,255,0.14)'}`,
        opacity: disabled ? 0.5 : 1,
      }}>
      <span
        className="absolute rounded-full transition-all duration-200"
        style={{
          width: 16, height: 16, top: 3,
          left: value ? 'calc(100% - 19px)' : 3,
          background: value ? '#AAFF00' : 'rgba(255,255,255,0.35)',
          boxShadow: value ? '0 0 6px rgba(170,255,0,0.5)' : 'none',
        }}
      />
    </button>
  )
}

function ToggleRow({ label, desc, value, onChange, disabled }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13.5px] text-[rgba(255,255,255,0.82)] font-medium leading-snug">{label}</p>
        <p className="text-[12px] text-[rgba(255,255,255,0.32)] mt-0.5 leading-[1.5]">{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </div>
  )
}

function NumberRow({ label, desc, value, onChange, min, max, unit }: {
  label: string; desc: string; value: number; onChange: (v: number) => void; min: number; max: number; unit?: string
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] text-[rgba(255,255,255,0.82)] font-medium leading-snug">{label}</p>
        <p className="text-[12px] text-[rgba(255,255,255,0.32)] mt-0.5 leading-[1.5]">{desc}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number" min={min} max={max} value={value}
          onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="w-[72px] text-center text-sm text-white rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-2 py-1.5 outline-none focus:border-[rgba(170,255,0,0.4)] focus:bg-[rgba(170,255,0,0.04)] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && <span className="text-[12px] text-[rgba(255,255,255,0.3)] w-12">{unit}</span>}
      </div>
    </div>
  )
}

function TextRow({ label, desc, value, onChange, placeholder, type = 'text' }: {
  label: string; desc: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="py-3.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 space-y-2">
      <div>
        <p className="text-[13.5px] text-[rgba(255,255,255,0.82)] font-medium leading-snug">{label}</p>
        <p className="text-[12px] text-[rgba(255,255,255,0.32)] mt-0.5 leading-[1.5]">{desc}</p>
      </div>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm text-white rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-3.5 py-2 outline-none focus:border-[rgba(170,255,0,0.4)] focus:bg-[rgba(170,255,0,0.04)] transition-all placeholder:text-[rgba(255,255,255,0.2)]"
      />
    </div>
  )
}

function ConfigCard({ title, icon, children, onSave, saving, badge }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  onSave: () => void
  saving: boolean
  badge?: string
}) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.18)] flex items-center justify-center text-[rgba(170,255,0,0.8)]">
            {icon}
          </span>
          <span className="text-[15px] font-semibold text-white">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(123,63,246,0.15)] text-[#B464FF] border border-[rgba(123,63,246,0.25)] uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer transition-all"
          style={{
            background: saving ? 'rgba(255,255,255,0.06)' : 'rgba(170,255,0,0.12)',
            color: saving ? 'rgba(255,255,255,0.3)' : '#AAFF00',
            border: `1px solid ${saving ? 'rgba(255,255,255,0.08)' : 'rgba(170,255,0,0.28)'}`,
          }}>
          {saving ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-[rgba(255,255,255,0.3)] animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>
              </svg>
              Guardar
            </>
          )}
        </button>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

// ── Export card ────────────────────────────────────────────────────────────────

function ExportCard({ users, players }: { users: UserRecord[]; players: PlayerProfile[] }) {
  const [exporting, setExporting] = useState<string | null>(null)

  const doExport = async (type: string) => {
    setExporting(type)
    await new Promise(r => setTimeout(r, 300))
    if (type === 'users') {
      exportToCsv('onechance-usuarios', users.map(u => ({
        uid: u.uid,
        nombre: u.name ?? '',
        email: u.email ?? '',
        rol: u.role ?? '',
        sistema: u.systemRole ?? 'user',
      })))
    } else {
      exportToCsv('onechance-jugadores', players.filter(p => p.status === 'published').map(p => ({
        uid: p.uid,
        nombre: p.fullName ?? '',
        posicion: p.position ?? '',
        nacionalidad: p.nationality ?? '',
        destacado: p.isFeatured ? 'Sí' : 'No',
      })))
    }
    setExporting(null)
  }

  const exports = [
    { id: 'users',   label: 'Exportar usuarios',  count: users.length,                                         unit: 'usuarios' },
    { id: 'players', label: 'Exportar jugadores',  count: players.filter(p => p.status === 'published').length, unit: 'publicados' },
  ]

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <span className="w-8 h-8 rounded-lg bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.18)] flex items-center justify-center text-[rgba(170,255,0,0.8)]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 3v11"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>
          </svg>
        </span>
        <span className="text-[15px] font-semibold text-white">Exportar datos</span>
        <span className="ml-auto text-[12px] text-[rgba(255,255,255,0.25)]">Formato CSV</span>
      </div>
      <div className="px-5 py-4 grid sm:grid-cols-2 gap-3">
        {exports.map(e => (
          <button
            key={e.id}
            type="button"
            disabled={!!exporting}
            onClick={() => doExport(e.id)}
            className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(170,255,0,0.2)] hover:bg-[rgba(170,255,0,0.04)] transition-all cursor-pointer text-left group"
            style={{ opacity: exporting && exporting !== e.id ? 0.5 : 1 }}>
            <span className="w-9 h-9 shrink-0 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[rgba(255,255,255,0.4)] group-hover:text-[#AAFF00] group-hover:bg-[rgba(170,255,0,0.08)] transition-all">
              {exporting === e.id
                ? <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#AAFF00] animate-spin" />
                : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 3v11"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>
              }
            </span>
            <div>
              <p className="text-[13px] font-medium text-white">{e.label}</p>
              <p className="text-[11px] text-[rgba(255,255,255,0.3)] mt-0.5">{e.count} {e.unit}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Danger zone ────────────────────────────────────────────────────────────────

function DangerZoneCard({ toast }: { toast: ToastAPI }) {
  const { firebaseUser } = useAuth()
  const [confirm, setConfirm] = useState<string | null>(null)
  const [running, setRunning] = useState<string | null>(null)

  const executePurge = async () => {
    if (!firebaseUser) return
    setRunning('purge')
    setConfirm(null)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/admin/purge-rejected', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast.success(`${data.deleted} perfiles rechazados eliminados`)
    } catch {
      toast.error('Error al purgar perfiles')
    } finally {
      setRunning(null)
    }
  }

  const actions = [
    {
      id: 'purge',
      label: 'Purgar perfiles rechazados',
      desc: 'Elimina permanentemente todos los perfiles con estado "rechazado".',
      onConfirm: executePurge,
    },
    {
      id: 'maint',
      label: 'Forzar cierre de sesiones',
      desc: 'Invalida todos los tokens activos. Los usuarios deberán volver a iniciar sesión.',
      onConfirm: () => { toast.info('Próximamente disponible'); setConfirm(null) },
    },
  ]

  return (
    <div className="rounded-xl border border-[rgba(255,60,60,0.18)] bg-[rgba(255,40,40,0.02)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,60,60,0.1)]">
        <span className="w-8 h-8 rounded-lg bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.2)] flex items-center justify-center">
          <svg className="w-4 h-4 text-[rgba(255,100,100,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </span>
        <span className="text-[15px] font-semibold text-[rgba(255,120,120,0.9)]">Zona de peligro</span>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[rgba(255,60,60,0.08)] text-[rgba(255,100,100,0.6)] border border-[rgba(255,60,60,0.14)]">
          Solo Super Admin
        </span>
      </div>
      <div className="px-5 py-4 space-y-3">
        {actions.map(a => (
          <div key={a.id} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
            <div>
              <p className="text-[13px] font-medium text-[rgba(255,255,255,0.7)]">{a.label}</p>
              <p className="text-[11px] text-[rgba(255,255,255,0.28)] mt-0.5 leading-[1.5]">{a.desc}</p>
            </div>
            {confirm === a.id ? (
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={!!running}
                  onClick={a.onConfirm}
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[rgba(255,60,60,0.15)] text-[rgba(255,100,100,0.9)] border border-[rgba(255,60,60,0.3)] cursor-pointer transition-all disabled:opacity-50">
                  {running === a.id ? '…' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.08)] cursor-pointer transition-all">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!!running}
                onClick={() => setConfirm(a.id)}
                className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.06)] text-[rgba(255,100,100,0.7)] hover:bg-[rgba(255,60,60,0.12)] hover:text-[rgba(255,120,120,0.9)] transition-all cursor-pointer disabled:opacity-50">
                {running === a.id ? 'Ejecutando…' : 'Ejecutar'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export default function AdminConfigPanel({ toast, users, players }: Props) {
  const { firebaseUser } = useAuth()
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Set<keyof PlatformConfig>>(new Set())

  const getToken = useCallback(async () => {
    if (!firebaseUser) throw new Error('No auth')
    return firebaseUser.getIdToken()
  }, [firebaseUser])

  useEffect(() => {
    let cancelled = false
    getToken()
      .then(token => fetch('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } }))
      .then(r => { if (!r.ok) throw new Error('api'); return r.json() })
      .then((data: Partial<PlatformConfig>) => {
        if (!cancelled) {
          setConfig({
            general:       { ...DEFAULT.general,       ...(data.general       ?? {}) },
            content:       { ...DEFAULT.content,       ...(data.content       ?? {}) },
            notifications: { ...DEFAULT.notifications, ...(data.notifications ?? {}) },
            features:      { ...DEFAULT.features,      ...(data.features      ?? {}) },
          })
          setLoading(false)
        }
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [getToken])

  const saveSection = useCallback(async (section: keyof PlatformConfig) => {
    setSaving(s => new Set(s).add(section))
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [section]: config[section] }),
      })
      if (!res.ok) throw new Error()
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(s => { const n = new Set(s); n.delete(section); return n })
    }
  }, [config, getToken, toast])

  const general       = config.general       ?? DEFAULT.general
  const content       = config.content       ?? DEFAULT.content
  const notifications = config.notifications ?? DEFAULT.notifications
  const features      = config.features      ?? DEFAULT.features

  if (loading || !config.general) {
    return (
      <div className="space-y-5">
        <div>
          <div className="h-6 w-52 rounded-lg bg-[rgba(255,255,255,0.06)] animate-pulse" />
          <div className="h-4 w-72 rounded mt-2 bg-[rgba(255,255,255,0.04)] animate-pulse" />
        </div>
        {[1, 2].map(i => (
          <div key={i} className="grid xl:grid-cols-2 gap-5">
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] h-[220px] animate-pulse bg-[rgba(255,255,255,0.02)]" />
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] h-[220px] animate-pulse bg-[rgba(255,255,255,0.02)]" />
          </div>
        ))}
      </div>
    )
  }

  const g = general
  const c = content
  const n = notifications
  const f = features

  const setG = (patch: Partial<typeof g>) => setConfig(cfg => ({ ...cfg, general: { ...cfg.general, ...patch } }))
  const setC = (patch: Partial<typeof c>) => setConfig(cfg => ({ ...cfg, content: { ...cfg.content, ...patch } }))
  const setN = (patch: Partial<typeof n>) => setConfig(cfg => ({ ...cfg, notifications: { ...cfg.notifications, ...patch } }))
  const setF = (patch: Partial<typeof f>) => setConfig(cfg => ({ ...cfg, features: { ...cfg.features, ...patch } }))

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Configuración del sitio</h2>
          <p className="text-sm text-[rgba(255,255,255,0.35)] mt-0.5">Parámetros globales de la plataforma — solo Super Admin</p>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[rgba(170,255,0,0.22)] bg-[rgba(170,255,0,0.06)] text-[rgba(170,255,0,0.7)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF00]" />
          Live
        </span>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* — General — */}
        <ConfigCard
          title="General"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>
            </svg>
          }
          onSave={() => saveSection('general')}
          saving={saving.has('general')}>
          <TextRow
            label="Nombre del sitio"
            desc="Aparece en el título del navegador y en los emails del sistema."
            value={g.siteName}
            onChange={v => setG({ siteName: v })}
          />
          <ToggleRow
            label="Modo mantenimiento"
            desc="Muestra una pantalla de mantenimiento a todos los usuarios. Los admins siguen teniendo acceso."
            value={g.maintenanceMode}
            onChange={v => setG({ maintenanceMode: v })}
            disabled={saving.has('general')}
          />
          <ToggleRow
            label="Registro habilitado"
            desc="Permite que nuevos usuarios creen una cuenta. Desactivar bloquea los registros nuevos."
            value={g.registrationEnabled}
            onChange={v => setG({ registrationEnabled: v })}
            disabled={saving.has('general')}
          />
        </ConfigCard>

        {/* — Contenido — */}
        <ConfigCard
          title="Gestión de contenido"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M8 3h8l4 4v14H4V3h4z"/><path d="M16 3v5h4"/>
              <path d="M8 13h8"/><path d="M8 17h5"/>
            </svg>
          }
          onSave={() => saveSection('content')}
          saving={saving.has('content')}>
          <ToggleRow
            label="Aprobación automática de perfiles"
            desc="Aprueba los perfiles automáticamente al enviarse, sin revisión manual del equipo."
            value={c.autoApproveProfiles}
            onChange={v => setC({ autoApproveProfiles: v })}
            disabled={saving.has('content')}
          />
          <ToggleRow
            label="Verificación de email requerida"
            desc="Los usuarios deben verificar su email antes de poder publicar su perfil."
            value={c.requireEmailVerification}
            onChange={v => setC({ requireEmailVerification: v })}
            disabled={saving.has('content')}
          />
          <NumberRow
            label="Máx. videos por jugador"
            desc="Cantidad máxima de videos que puede agregar cada jugador a su perfil."
            value={c.maxVideosPerPlayer}
            onChange={v => setC({ maxVideosPerPlayer: v })}
            min={1} max={50} unit="videos"
          />
          <NumberRow
            label="Máx. jugadores destacados"
            desc="Cantidad máxima de jugadores visibles en la sección de destacados de la plataforma."
            value={c.maxFeaturedPlayers}
            onChange={v => setC({ maxFeaturedPlayers: v })}
            min={0} max={200} unit="perfiles"
          />
        </ConfigCard>

        {/* — Notificaciones — */}
        <ConfigCard
          title="Notificaciones"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          }
          onSave={() => saveSection('notifications')}
          saving={saving.has('notifications')}>
          <TextRow
            label="Email del administrador"
            desc="Recibe alertas del sistema, reportes y resúmenes en esta dirección."
            value={n.adminEmail}
            onChange={v => setN({ adminEmail: v })}
            placeholder="admin@onechance.com"
            type="email"
          />
          <ToggleRow
            label="Alertas de nuevas solicitudes"
            desc="Notificar por email cuando un usuario envía su perfil para revisión."
            value={n.newRequestAlerts}
            onChange={v => setN({ newRequestAlerts: v })}
            disabled={saving.has('notifications')}
          />
          <ToggleRow
            label="Resumen semanal"
            desc="Recibir un resumen semanal con métricas de la plataforma por email."
            value={n.weeklySummary}
            onChange={v => setN({ weeklySummary: v })}
            disabled={saving.has('notifications')}
          />
        </ConfigCard>

        {/* — Feature flags — */}
        <ConfigCard
          title="Módulos"
          badge="Experimental"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
          }
          onSave={() => saveSection('features')}
          saving={saving.has('features')}>
          <ToggleRow
            label="Suscripciones y planes premium"
            desc="Habilitar planes de pago, perfiles verificados y funciones premium."
            value={f.subscriptionsEnabled}
            onChange={v => setF({ subscriptionsEnabled: v })}
            disabled={saving.has('features')}
          />
          <ToggleRow
            label="Mensajería interna"
            desc="Permitir que los usuarios se contacten directamente dentro de la plataforma."
            value={f.messagingEnabled}
            onChange={v => setF({ messagingEnabled: v })}
            disabled={saving.has('features')}
          />
          <ToggleRow
            label="Módulo de embajadores"
            desc="Habilitar perfiles de embajadores y representantes de la marca OneChance."
            value={f.ambassadorsEnabled}
            onChange={v => setF({ ambassadorsEnabled: v })}
            disabled={saving.has('features')}
          />
        </ConfigCard>
      </div>

      {/* Export — full width */}
      <ExportCard users={users} players={players} />

      {/* Danger zone — full width */}
      <DangerZoneCard toast={toast} />

    </div>
  )
}
