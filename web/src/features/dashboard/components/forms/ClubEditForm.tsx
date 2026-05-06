'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { updateClub } from '@/lib/firestore'
import { COUNTRIES, POSITIONS } from '@/types'
import type { ClubProfile } from '@/types'

export default function ClubEditForm({ club, uid, onSaved }: { club: ClubProfile; uid: string; onSaved: (c: ClubProfile) => void }) {
  const [form, setForm] = useState({ name: club.name, country: club.country, city: club.city, division: club.division, currentCoach: club.currentCoach, bio: club.bio, founded: club.founded })
  const [seeking, setSeeking] = useState<string[]>(club.seeking ?? [])
  const [seekInput, setSeekInput] = useState('')
  const [achievements, setAchievements] = useState<string[]>(club.achievements ?? [])
  const [achInput, setAchInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const divisions = ['Primera Division', 'Segunda Division', 'Tercera Division', 'Liga Amateur', 'Juveniles', 'Femenino']
  const addSeeking = () => { const val = seekInput.trim(); if (!val || seeking.includes(val)) return; setSeeking(s => [...s, val]); setSeekInput('') }
  const addAchievement = () => { const val = achInput.trim(); if (!val) return; setAchievements(a => [...a, val]); setAchInput('') }
  const save = async () => { setSaving(true); const data = { ...form, seeking, achievements }; await updateClub(uid, data as Partial<ClubProfile>); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); onSaved({ ...club, ...data }) }
  return <SurfaceCard><div className="text-white text-[13px] font-medium mb-4">Editar perfil del club</div><div className="flex flex-col gap-2.5"><Input placeholder="Nombre del club" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /><Select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} options={[{ value: '', label: 'Pais' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} /><Input placeholder="Ciudad" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /><Select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} options={[{ value: '', label: 'Division' }, ...divisions.map(d => ({ value: d, label: d }))]} /><Input placeholder="Director tecnico" value={form.currentCoach} onChange={e => setForm(f => ({ ...f, currentCoach: e.target.value }))} /><Input placeholder="Anio de fundacion" type="number" value={form.founded ? String(form.founded) : ''} onChange={e => setForm(f => ({ ...f, founded: parseInt(e.target.value) || 0 }))} /><Textarea placeholder="Descripcion institucional" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} /><div><div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Posiciones buscadas</div><div className="flex gap-1.5 flex-wrap mb-2">{seeking.map(s => <span key={s} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[20px] bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.3)] text-[#FFB400]">{s}<button onClick={() => setSeeking(ss => ss.filter(x => x !== s))} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button></span>)}</div><div className="flex gap-2"><Select value={seekInput} onChange={e => setSeekInput(e.target.value)} options={[{ value: '', label: 'Seleccionar posicion...' }, ...POSITIONS.map(p => ({ value: p, label: p }))]} /><Button variant="outline" size="sm" onClick={addSeeking} disabled={!seekInput}>+</Button></div></div><div><div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Logros destacados</div><div className="flex flex-col gap-1.5 mb-2">{achievements.map((a, i) => <div key={i} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.5)]"><span className="text-[13px]">🏆</span><span className="flex-1">{a}</span><button onClick={() => setAchievements(as => as.filter((_, idx) => idx !== i))} className="text-[rgba(255,60,60,0.4)] hover:text-[#FF6060] cursor-pointer bg-transparent border-none text-[12px]">✕</button></div>)}</div><div className="flex gap-2"><Input placeholder="Ej: Campeon Liga 2023" value={achInput} onChange={e => setAchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAchievement())} /><Button variant="outline" size="sm" onClick={addAchievement} disabled={!achInput.trim()}>+</Button></div></div></div><Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>{saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}</Button></SurfaceCard>
}
