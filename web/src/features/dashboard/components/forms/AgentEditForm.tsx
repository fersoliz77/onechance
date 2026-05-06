'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { updateAgent } from '@/lib/firestore'
import { COUNTRIES } from '@/types'
import type { AgentProfile } from '@/types'

export default function AgentEditForm({ agent, uid, onSaved }: { agent: AgentProfile; uid: string; onSaved: (a: AgentProfile) => void }) {
  const [form, setForm] = useState({ fullName: agent.fullName, nationality: agent.nationality, agencyName: agent.agencyName, players: agent.players, countries: agent.countries, bio: agent.bio, career: agent.career })
  const [markets, setMarkets] = useState<string[]>(agent.markets ?? [])
  const [marketInput, setMarketInput] = useState('')
  const [transfers, setTransfers] = useState<string[]>(agent.notableTransfers ?? [])
  const [transferInput, setTransferInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const addMarket = () => { const val = marketInput.trim(); if (!val || markets.includes(val)) return; setMarkets(m => [...m, val]); setMarketInput('') }
  const addTransfer = () => { const val = transferInput.trim(); if (!val) return; setTransfers(t => [...t, val]); setTransferInput('') }
  const save = async () => { setSaving(true); const data = { ...form, markets, notableTransfers: transfers }; await updateAgent(uid, data as Partial<AgentProfile>); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); onSaved({ ...agent, ...data }) }
  return <SurfaceCard><div className="text-white text-[13px] font-medium mb-4">Editar perfil del representante</div><div className="flex flex-col gap-2.5"><Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /><Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} /><Input placeholder="Nombre de agencia" value={form.agencyName} onChange={e => setForm(f => ({ ...f, agencyName: e.target.value }))} /><div className="grid grid-cols-2 gap-2"><Input placeholder="Jugadores representados" type="number" value={String(form.players)} onChange={e => setForm(f => ({ ...f, players: parseInt(e.target.value, 10) || 0 }))} /><Input placeholder="Paises donde opera" type="number" value={String(form.countries)} onChange={e => setForm(f => ({ ...f, countries: parseInt(e.target.value, 10) || 0 }))} /></div><Input placeholder="Trayectoria resumida" value={form.career} onChange={e => setForm(f => ({ ...f, career: e.target.value }))} /><Textarea placeholder="Bio / Descripcion" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} /><div><div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Mercados donde opera</div><div className="flex gap-1.5 flex-wrap mb-2">{markets.map(m => <span key={m} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[20px] bg-[rgba(180,100,255,0.1)] border border-[rgba(180,100,255,0.3)] text-[#B464FF]">{m}<button onClick={() => setMarkets(ms => ms.filter(x => x !== m))} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button></span>)}</div><div className="flex gap-2"><Select value={marketInput} onChange={e => setMarketInput(e.target.value)} options={[{ value: '', label: 'Pais / Mercado...' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} /><Button variant="outline" size="sm" onClick={addMarket} disabled={!marketInput}>+</Button></div></div><div><div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Transfers destacados</div><div className="flex flex-col gap-1.5 mb-2">{transfers.map((t, i) => <div key={i} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.5)]"><span className="w-[5px] h-[5px] rounded-full bg-[#B464FF] shrink-0" /><span className="flex-1">{t}</span><button onClick={() => setTransfers(ts => ts.filter((_, idx) => idx !== i))} className="text-[rgba(255,60,60,0.4)] hover:text-[#FF6060] cursor-pointer bg-transparent border-none text-[12px]">✕</button></div>)}</div><div className="flex gap-2"><Input placeholder="Ej: Jugador X -> Club Y (2024)" value={transferInput} onChange={e => setTransferInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTransfer())} /><Button variant="outline" size="sm" onClick={addTransfer} disabled={!transferInput.trim()}>+</Button></div></div></div><Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>{saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}</Button></SurfaceCard>
}
