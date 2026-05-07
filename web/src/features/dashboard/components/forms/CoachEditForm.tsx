'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { updateCoach } from '@/lib/firestore'
import { COUNTRIES } from '@/types'
import type { CoachProfile } from '@/types'

export default function CoachEditForm({ coach, uid, onSaved }: { coach: CoachProfile; uid: string; onSaved: (c: CoachProfile) => void }) {
  const [form, setForm] = useState({ fullName: coach.fullName, bio: coach.bio, nationality: coach.nationality, currentClub: coach.currentClub, years: coach.years })
  const [skills, setSkills] = useState<string[]>(coach.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [career, setCareer] = useState(coach.career ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const addSkill = () => { const val = skillInput.trim(); if (!val || skills.includes(val)) return; setSkills(s => [...s, val]); setSkillInput('') }
  const addCareerEntry = () => setCareer(c => [...c, { club: '', role: '', years: '' }])
  const removeCareerEntry = (i: number) => setCareer(c => c.filter((_, idx) => idx !== i))
  const updateCareer = (i: number, field: 'club' | 'role' | 'years', value: string) => setCareer(c => c.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  const save = async () => { setSaving(true); const data = { ...form, skills, career }; await updateCoach(uid, data as Partial<CoachProfile>); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); onSaved({ ...coach, ...data }) }
  return <SurfaceCard><div className="text-white text-[14px] font-medium mb-4">Editar perfil</div><div className="flex flex-col gap-2.5"><Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /><Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} /><Input placeholder="Club actual" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} /><Input placeholder="Anios de experiencia" type="number" value={String(form.years)} onChange={e => setForm(f => ({ ...f, years: parseInt(e.target.value) || 0 }))} /><Textarea placeholder="Bio / Descripcion" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} /><div><div className="text-[rgba(255,255,255,0.3)] text-[11px] uppercase tracking-[0.07em] mb-2">Habilidades</div><div className="flex gap-1.5 flex-wrap mb-2">{skills.map(s => <span key={s} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-[20px] bg-[rgba(90,143,255,0.1)] border border-[rgba(90,143,255,0.3)] text-[#5A8FFF]">{s}<button onClick={() => setSkills(ss => ss.filter(x => x !== s))} className="text-[11px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button></span>)}</div><div className="flex gap-2"><Input placeholder="Agregar habilidad..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} /><Button variant="outline" size="sm" onClick={addSkill} disabled={!skillInput.trim()}>+</Button></div></div><div><div className="flex items-center justify-between mb-2"><div className="text-[rgba(255,255,255,0.3)] text-[11px] uppercase tracking-[0.07em]">Trayectoria</div><Button variant="ghost" size="sm" onClick={addCareerEntry} className="text-[11px] !py-1 !px-2">+ Agregar</Button></div><div className="flex flex-col gap-2">{career.map((entry, i) => <div key={i} className="grid grid-cols-[1fr_1fr_80px_28px] gap-1.5"><Input placeholder="Club" value={entry.club} onChange={e => updateCareer(i, 'club', e.target.value)} /><Input placeholder="Rol (ej: DT)" value={entry.role} onChange={e => updateCareer(i, 'role', e.target.value)} /><Input placeholder="Periodo" value={entry.years} onChange={e => updateCareer(i, 'years', e.target.value)} /><button onClick={() => removeCareerEntry(i)} className="text-[rgba(255,60,60,0.5)] hover:text-[#FF6060] text-[13px] cursor-pointer bg-transparent border-none flex items-center justify-center">✕</button></div>)}</div></div></div><Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>{saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}</Button></SurfaceCard>
}
