'use client'
import { useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import { ROLE_LABELS, ROLE_ACCENT } from '@/lib/constants'
import type { SubscriptionPlan } from '@/types/plans'
import type { Role } from '@/types'
import PlanDrawer from './PlanDrawer'

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_FILTERS: { value: Role | 'all'; label: string }[] = [
  { value: 'all',    label: 'Todos' },
  { value: 'player', label: 'Jugadores' },
  { value: 'coach',  label: 'Técnicos' },
  { value: 'club',   label: 'Clubes' },
  { value: 'agent',  label: 'Representantes' },
]

const INTERVAL_LABEL = { monthly: 'mes', yearly: 'año' }

// ── Plan card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan:      SubscriptionPlan
  onEdit:    () => void
  onDelete:  () => void
  onToggle:  () => void
  toggling:  boolean
}

function PlanCard({ plan, onEdit, onDelete, onToggle, toggling }: PlanCardProps) {
  const accent = ROLE_ACCENT[plan.role]

  return (
    <div
      className="rounded-2xl border flex flex-col transition-all"
      style={{
        background:   plan.isFeatured ? `linear-gradient(135deg,${accent}0D,rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.02)',
        borderColor:  plan.isFeatured ? `${accent}44` : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Featured ribbon */}
      {plan.isFeatured && (
        <div
          className="px-4 py-1.5 rounded-t-2xl flex items-center gap-1.5 text-[11px] font-bold tracking-wide"
          style={{ background: `${accent}22`, color: accent }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          RECOMENDADO
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Role pill + name */}
        <div className="space-y-2">
          <span
            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: accent, background: `${accent}18` }}
          >
            {ROLE_LABELS[plan.role]}
          </span>
          <p className="text-white font-bold text-[18px] leading-tight">{plan.name}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          {plan.price === 0
            ? <span className="text-[28px] font-black text-white">Gratis</span>
            : (
              <>
                <span className="text-[13px] font-semibold text-[rgba(255,255,255,0.4)] mt-1 self-start">{plan.currency}</span>
                <span className="text-[32px] font-black text-white leading-none">
                  {plan.price % 1 === 0 ? plan.price : plan.price.toFixed(2)}
                </span>
                <span className="text-[13px] text-[rgba(255,255,255,0.35)] mb-0.5 self-end">/ {INTERVAL_LABEL[plan.interval]}</span>
              </>
            )
          }
        </div>

        {/* Features */}
        <div className="flex-1 space-y-2">
          {plan.features.length > 0
            ? plan.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6 9 17l-5-5"/></svg>
                <span className="text-[13px] text-[rgba(255,255,255,0.6)]">{f}</span>
              </div>
            ))
            : <p className="text-[12px] text-[rgba(255,255,255,0.2)] italic">Sin características definidas</p>
          }
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.06)]" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Active toggle */}
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer disabled:opacity-50"
            style={plan.isActive
              ? { color: '#00C853', background: 'rgba(0,200,83,0.1)', borderColor: 'rgba(0,200,83,0.3)' }
              : { color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }
            }
          >
            {toggling
              ? <span className="w-1.5 h-1.5 rounded-full border border-t-transparent border-current animate-spin" />
              : <span className="w-1.5 h-1.5 rounded-full bg-current" />
            }
            {plan.isActive ? 'Activo' : 'Inactivo'}
          </button>

          <div className="flex-1" />

          {/* Edit */}
          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[rgba(255,100,100,0.5)] hover:text-[#FF5050] hover:bg-[rgba(255,80,80,0.08)] hover:border-[rgba(255,80,80,0.3)] transition-all cursor-pointer bg-transparent"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ plan, onConfirm, onCancel }: {
  plan: SubscriptionPlan; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'oc-fadeIn 0.15s ease both' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#111] p-6 space-y-4"
        style={{ animation: 'oc-fadeUp 0.15s ease both' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-white font-semibold text-[16px]">Eliminar plan</p>
          <p className="text-[13px] text-[rgba(255,255,255,0.45)]">
            ¿Eliminar <span className="text-white font-medium">"{plan.name}"</span>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] text-[13px] hover:text-white transition-colors cursor-pointer bg-transparent"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.4)] text-[#F43F5E] text-[13px] font-medium hover:bg-[rgba(244,63,94,0.25)] transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminSubscriptionsTab() {
  const [plans,       setPlans]       = useState<SubscriptionPlan[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [roleFilter,  setRoleFilter]  = useState<Role | 'all'>('all')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [editing,     setEditing]     = useState<SubscriptionPlan | null>(null)
  const [toDelete,    setToDelete]    = useState<SubscriptionPlan | null>(null)
  const [toggling,    setToggling]    = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/plans')
      const json = await res.json()
      setPlans(json.plans ?? [])
    } catch {
      setError('No se pudieron cargar los planes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const getToken = async () => auth.currentUser?.getIdToken()

  const handleSaved = (saved: SubscriptionPlan) => {
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved]
    })
  }

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    if (toggling) return
    setToggling(plan.id)
    try {
      const token = await getToken()
      await fetch(`/api/admin/plans/${plan.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ isActive: !plan.isActive }),
      })
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: !plan.isActive } : p))
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    const plan = toDelete
    setToDelete(null)
    try {
      const token = await getToken()
      await fetch(`/api/admin/plans/${plan.id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setPlans(prev => prev.filter(p => p.id !== plan.id))
    } catch {
      setError('Error al eliminar el plan')
    }
  }

  const openCreate = () => { setEditing(null); setDrawerOpen(true) }
  const openEdit   = (p: SubscriptionPlan) => { setEditing(p); setDrawerOpen(true) }

  const filtered = roleFilter === 'all' ? plans : plans.filter(p => p.role === roleFilter)

  const stats = {
    total:  plans.length,
    active: plans.filter(p => p.isActive).length,
    player: plans.filter(p => p.role === 'player').length,
    coach:  plans.filter(p => p.role === 'coach').length,
    club:   plans.filter(p => p.role === 'club').length,
    agent:  plans.filter(p => p.role === 'agent').length,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Suscripciones</h2>
          <p className="text-sm text-[rgba(255,255,255,0.35)] mt-0.5">
            {stats.total} planes · {stats.active} activos
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(170,255,0,0.1)] border border-[rgba(170,255,0,0.28)] text-[#AAFF00] text-[13px] font-medium hover:bg-[rgba(170,255,0,0.18)] transition-all cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Nuevo plan
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['player','coach','club','agent'] as Role[]).map(role => {
          const count  = stats[role]
          const accent = ROLE_ACCENT[role]
          return (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className="rounded-xl border p-3 text-left transition-all cursor-pointer"
              style={{
                background:  roleFilter === role ? `${accent}0F` : 'rgba(255,255,255,0.02)',
                borderColor: roleFilter === role ? `${accent}44` : 'rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
                {ROLE_LABELS[role]}
              </p>
              <p className="text-[22px] font-black text-white mt-0.5">{count}</p>
              <p className="text-[11px] text-[rgba(255,255,255,0.3)]">
                {count === 1 ? 'plan' : 'planes'}
              </p>
            </button>
          )
        })}
      </div>

      {/* Role filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {ROLE_FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setRoleFilter(f.value as Role | 'all')}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
            style={{
              background:  roleFilter === f.value ? 'rgba(170,255,0,0.1)' : 'rgba(255,255,255,0.04)',
              color:       roleFilter === f.value ? '#AAFF00' : 'rgba(255,255,255,0.45)',
              borderColor: roleFilter === f.value ? 'rgba(170,255,0,0.3)' : 'rgba(255,255,255,0.08)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] h-64 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-[rgba(255,80,80,0.2)] bg-[rgba(255,80,80,0.05)] py-10 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-20 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(170,255,0,0.06)] border border-[rgba(170,255,0,0.15)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[rgba(170,255,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="text-center space-y-1">
            <p className="text-[rgba(255,255,255,0.4)] text-sm font-medium">
              {roleFilter === 'all' ? 'No hay planes creados' : `No hay planes para ${ROLE_LABELS[roleFilter as Role]}`}
            </p>
            <p className="text-[rgba(255,255,255,0.2)] text-[12px]">
              Creá el primer plan con el botón de arriba
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="text-[13px] text-[rgba(170,255,0,0.7)] hover:text-[#AAFF00] underline cursor-pointer bg-transparent border-none transition-colors"
          >
            Crear plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered
            .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
            .map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={()    => openEdit(plan)}
                onDelete={()  => setToDelete(plan)}
                onToggle={()  => handleToggleActive(plan)}
                toggling={toggling === plan.id}
              />
            ))
          }
        </div>
      )}

      {/* Drawers & modals */}
      <PlanDrawer
        open={drawerOpen}
        plan={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />

      {toDelete && (
        <DeleteConfirm
          plan={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
