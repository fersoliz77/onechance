'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { COUNTRIES } from '@/types'
import type { AgentProfile } from '@/types'

async function updateProfile(uid: string, role: 'agent', data: Partial<AgentProfile>) {
  const res = await fetch(`/api/profiles/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, data }),
  })
  if (!res.ok) throw new Error('No se pudo guardar el perfil')
}

export default function AgentEditForm({ agent, uid, onSaved }: { agent: AgentProfile; uid: string; onSaved: (a: AgentProfile) => void }) {
  const [form, setForm] = useState({
    fullName: agent.fullName,
    nationality: agent.nationality,
    agencyName: agent.agencyName,
    players: agent.players,
    countries: agent.countries,
    bio: agent.bio,
    career: agent.career,
  })
  const [markets, setMarkets] = useState<string[]>(agent.markets ?? [])
  const [marketInput, setMarketInput] = useState('')
  const [transfers, setTransfers] = useState<string[]>(agent.notableTransfers ?? [])
  const [transferInput, setTransferInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addMarket = () => {
    const val = marketInput.trim()
    if (!val || markets.includes(val)) return
    setMarkets((m) => [...m, val])
    setMarketInput('')
  }
  const addTransfer = () => {
    const val = transferInput.trim()
    if (!val) return
    setTransfers((t) => [...t, val])
    setTransferInput('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const data = { ...form, markets, notableTransfers: transfers }
      await updateProfile(uid, 'agent', data as Partial<AgentProfile>)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved({ ...agent, ...data })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SurfaceCard>
      <div className="mb-4 text-[14px] font-medium text-white">Editar perfil del representante</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map((c) => ({ value: c, label: c }))]} />
        <Input placeholder="Nombre de agencia" value={form.agencyName} onChange={(e) => setForm((f) => ({ ...f, agencyName: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Jugadores representados" type="number" value={String(form.players)} onChange={(e) => setForm((f) => ({ ...f, players: parseInt(e.target.value, 10) || 0 }))} />
          <Input placeholder="Paises donde opera" type="number" value={String(form.countries)} onChange={(e) => setForm((f) => ({ ...f, countries: parseInt(e.target.value, 10) || 0 }))} />
        </div>
        <Input placeholder="Trayectoria resumida" value={form.career} onChange={(e) => setForm((f) => ({ ...f, career: e.target.value }))} />
        <Textarea placeholder="Bio / Descripcion" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Mercados donde opera</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {markets.map((m) => (
              <span key={m} className="flex items-center gap-1 rounded-[20px] border border-[rgba(180,100,255,0.3)] bg-[rgba(180,100,255,0.1)] px-2.5 py-1 text-[11px] text-[#B464FF]">
                {m}
                <button onClick={() => setMarkets((ms) => ms.filter((x) => x !== m))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={marketInput} onChange={(e) => setMarketInput(e.target.value)} options={[{ value: '', label: 'Pais / Mercado...' }, ...COUNTRIES.map((c) => ({ value: c, label: c }))]} />
            <Button variant="outline" size="sm" onClick={addMarket} disabled={!marketInput.trim()}>+</Button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Transferencias destacadas</div>
          <div className="mb-2 space-y-1.5">
            {transfers.map((t, i) => (
              <div key={`${t}-${i}`} className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.6)]">
                <span>↗</span>
                <span className="flex-1">{t}</span>
                <button onClick={() => setTransfers((tt) => tt.filter((_, idx) => idx !== i))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar transferencia..." value={transferInput} onChange={(e) => setTransferInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTransfer())} />
            <Button variant="outline" size="sm" onClick={addTransfer} disabled={!transferInput.trim()}>+</Button>
          </div>
        </div>

        {saved ? <div className="text-[12px] text-[#00C853]">Guardado ✓</div> : null}
        <Button variant="primary" className="w-full justify-center" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
      </div>
    </SurfaceCard>
  )
}
