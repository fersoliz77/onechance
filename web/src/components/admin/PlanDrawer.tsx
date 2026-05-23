'use client'
import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { auth } from '@/lib/firebase'
import { ROLE_LABELS, ROLE_ACCENT } from '@/lib/constants'
import type { SubscriptionPlan, PlanDraft, PlanCurrency, PlanInterval } from '@/types/plans'
import type { Role } from '@/types'

interface Props {
  plan:    SubscriptionPlan | null   // null = create mode
  open:    boolean
  onClose: () => void
  onSaved: (plan: SubscriptionPlan) => void
}

// ── Primitives ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-white text-[13px] outline-none focus:border-[rgba(170,255,0,0.4)] focus:bg-[rgba(170,255,0,0.02)] placeholder:text-[rgba(255,255,255,0.2)] transition-colors'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-[rgba(255,255,255,0.4)]">{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.25)]">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0 w-full text-left"
    >
      <div
        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
        style={{ background: checked ? 'rgba(170,255,0,0.8)' : 'rgba(255,255,255,0.12)' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(2px)' }}
        />
      </div>
      <span className="text-[13px]" style={{ color: checked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
    </button>
  )
}

function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const t = input.trim()
    if (!t || value.includes(t)) { setInput(''); return }
    onChange([...value, t])
    setInput('')
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-col gap-1">
          {value.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgba(170,255,0,0.6)] shrink-0" />
              <span className="flex-1 text-[13px] text-[rgba(255,255,255,0.7)]">{feat}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-[rgba(255,255,255,0.25)] hover:text-white cursor-pointer bg-transparent border-none leading-none shrink-0"
              >×</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Agregar característica…'}
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.2)] text-[#AAFF00] text-[13px] hover:bg-[rgba(170,255,0,0.15)] transition-colors cursor-pointer shrink-0"
        >+</button>
      </div>
    </div>
  )
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const BLANK: PlanDraft = {
  name:       '',
  role:       'player',
  price:      9.99,
  currency:   'USD',
  interval:   'monthly',
  features:   [],
  isActive:   true,
  isFeatured: false,
  order:      0,
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'player', label: 'Jugadores' },
  { value: 'coach',  label: 'Técnicos' },
  { value: 'club',   label: 'Clubes' },
  { value: 'agent',  label: 'Representantes' },
]

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PlanDrawer({ plan, open, onClose, onSaved }: Props) {
  const isEdit = plan !== null
  const [draft,  setDraft]  = useState<PlanDraft>(BLANK)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  useEffect(() => {
    if (open) {
      setDraft(plan ? {
        name: plan.name, role: plan.role, price: plan.price, currency: plan.currency,
        interval: plan.interval, features: [...plan.features],
        isActive: plan.isActive, isFeatured: plan.isFeatured, order: plan.order,
        stripePriceId: plan.stripePriceId,
      } : BLANK)
      setError('')
    }
  }, [open, plan])

  const set = useCallback(<K extends keyof PlanDraft>(k: K, v: PlanDraft[K]) => {
    setDraft(prev => ({ ...prev, [k]: v }))
  }, [])

  const handleSave = async () => {
    if (saving) return
    if (!draft.name.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    setError('')
    try {
      const token = await auth.currentUser?.getIdToken()
      const url    = isEdit ? `/api/admin/plans/${plan!.id}` : '/api/admin/plans'
      const method = isEdit ? 'PATCH' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(draft),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar')

      const now = new Date().toISOString()
      const saved: SubscriptionPlan = isEdit
        ? { ...plan!, ...draft, updatedAt: now }
        : { ...draft, id: json.id, createdAt: now, updatedAt: now }

      onSaved(saved)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const accent = ROLE_ACCENT[draft.role]

  return (
    <>
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', animation: 'oc-fadeIn 0.2s ease both' }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 z-[401] h-full w-full max-w-[520px] bg-[#0D0D0D] border-l border-[rgba(255,255,255,0.08)] flex flex-col"
        style={{ animation: 'oc-slideInRight 0.28s cubic-bezier(0.32,0.72,0,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}
          >
            <svg className="w-4.5 h-4.5" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-[15px]">{isEdit ? 'Editar plan' : 'Nuevo plan'}</p>
            <p className="text-[11px] text-[rgba(255,255,255,0.3)]">{isEdit ? plan!.name : 'Completá los datos del plan'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.3)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer bg-transparent border-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          <Section title="Información básica">
            <Field label="Nombre del plan">
              <input
                value={draft.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ej: Jugador Pro"
                className={inputCls}
              />
            </Field>
            <Field label="Rol">
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => {
                  const ac = ROLE_ACCENT[r.value]
                  const sel = draft.role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('role', r.value)}
                      className="px-3 py-2 rounded-lg border text-[13px] font-medium transition-all cursor-pointer"
                      style={{
                        background:   sel ? `${ac}18` : 'rgba(255,255,255,0.03)',
                        borderColor:  sel ? `${ac}44` : 'rgba(255,255,255,0.08)',
                        color:        sel ? ac : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {r.label}
                    </button>
                  )
                })}
              </div>
            </Field>
          </Section>

          <Section title="Precio">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Precio">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.price}
                  onChange={e => set('price', parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </Field>
              <Field label="Moneda">
                <select
                  value={draft.currency}
                  onChange={e => set('currency', e.target.value as PlanCurrency)}
                  className={`${inputCls} cursor-pointer`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
              </Field>
              <Field label="Período">
                <select
                  value={draft.interval}
                  onChange={e => set('interval', e.target.value as PlanInterval)}
                  className={`${inputCls} cursor-pointer`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </Field>
            </div>
            <Field label="Stripe Price ID (opcional)">
              <input
                value={draft.stripePriceId ?? ''}
                onChange={e => set('stripePriceId', e.target.value || undefined)}
                placeholder="price_xxxxxxxxxxxx"
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Características">
            <TagInput
              value={draft.features}
              onChange={v => set('features', v)}
              placeholder="Agregar característica del plan…"
            />
          </Section>

          <Section title="Visibilidad">
            <Toggle
              checked={draft.isActive}
              onChange={v => set('isActive', v)}
              label="Plan activo (visible para usuarios)"
            />
            <Toggle
              checked={draft.isFeatured}
              onChange={v => set('isFeatured', v)}
              label="Plan recomendado (se resalta en la lista)"
            />
            <Field label="Orden de visualización">
              <input
                type="number"
                min={0}
                value={draft.order}
                onChange={e => set('order', parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
          </Section>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[rgba(255,255,255,0.07)] flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {error && <p className="text-[12px] text-red-400 truncate">{error}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] text-[13px] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent shrink-0"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[rgba(170,255,0,0.1)] border border-[rgba(170,255,0,0.28)] text-[#AAFF00] text-[13px] font-medium hover:bg-[rgba(170,255,0,0.18)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {saving && <span className="w-3 h-3 rounded-full border-[1.5px] border-t-transparent border-[#AAFF00] animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear plan'}
          </button>
        </div>
      </div>
    </>
  )
}
