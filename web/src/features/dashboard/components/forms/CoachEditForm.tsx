'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { COUNTRIES } from '@/types'
import type { CoachProfile } from '@/types'
import { calcCoachCompletion } from '@/lib/completion'
import { updateProfileState } from '@/lib/rtdb'

async function updateProfile(uid: string, role: 'coach', data: Partial<CoachProfile>) {
  const res = await fetch(`/api/profiles/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, data }),
  })
  if (!res.ok) throw new Error('No se pudo guardar el perfil')
}

export default function CoachEditForm({ coach, uid, onSaved }: { coach: CoachProfile; uid: string; onSaved: (c: CoachProfile) => void }) {
  const [form, setForm] = useState({
    fullName:  coach.fullName,
    bio:       coach.bio,
    nationality: coach.nationality,
    currentClub: coach.currentClub,
    years:     coach.years,
    age:       coach.age,
    avatarUrl: coach.avatarUrl ?? '',
  })
  const [skills, setSkills] = useState<string[]>(coach.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [career, setCareer] = useState(coach.career ?? [])
  const [languages, setLanguages] = useState<string[]>(coach.languages ?? [])
  const [langInput, setLangInput] = useState('')
  const [trophies, setTrophies] = useState<string[]>(coach.trophies ?? [])
  const [trophyInput, setTrophyInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const addSkill = () => {
    const val = skillInput.trim()
    if (!val || skills.includes(val)) return
    setSkills((s) => [...s, val])
    setSkillInput('')
  }
  const addCareerEntry = () => setCareer((c) => [...c, { club: '', role: '', years: '' }])
  const removeCareerEntry = (i: number) => setCareer((c) => c.filter((_, idx) => idx !== i))
  const updateCareer = (i: number, field: 'club' | 'role' | 'years', value: string) => setCareer((c) => c.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)))
  const addLanguage = () => {
    const val = langInput.trim()
    if (!val || languages.includes(val)) return
    setLanguages((l) => [...l, val])
    setLangInput('')
  }
  const addTrophy = () => {
    const val = trophyInput.trim()
    if (!val) return
    setTrophies((t) => [...t, val])
    setTrophyInput('')
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const data: Partial<CoachProfile> = {
        ...form,
        avatarUrl: form.avatarUrl || undefined,
        skills,
        career,
        languages,
        trophies,
      }
      await updateProfile(uid, 'coach', data)
      const completionPct = calcCoachCompletion({ ...coach, ...data })
      await updateProfileState(uid, { completionPct }).catch(() => {})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved({ ...coach, ...data })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SurfaceCard>
      <div className="mb-4 text-[14px] font-medium text-white">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map((c) => ({ value: c, label: c }))]} />
        <Input placeholder="Club actual" value={form.currentClub} onChange={(e) => setForm((f) => ({ ...f, currentClub: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Anios de experiencia" type="number" value={String(form.years)} onChange={(e) => setForm((f) => ({ ...f, years: parseInt(e.target.value, 10) || 0 }))} />
          <Input placeholder="Edad" type="number" value={String(form.age)} onChange={(e) => setForm((f) => ({ ...f, age: parseInt(e.target.value, 10) || 0 }))} />
        </div>
        <Textarea placeholder="Bio / Descripcion" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />

        <div className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Foto de perfil</div>
        <Input placeholder="URL de foto de perfil (avatar)" value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} />

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Habilidades</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-[20px] border border-[rgba(90,143,255,0.3)] bg-[rgba(90,143,255,0.1)] px-2.5 py-1 text-[11px] text-[#5A8FFF]">
                {s}
                <button onClick={() => setSkills((ss) => ss.filter((x) => x !== s))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar habilidad..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <Button variant="outline" size="sm" onClick={addSkill} disabled={!skillInput.trim()}>+</Button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Idiomas</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <span key={l} className="flex items-center gap-1 rounded-[20px] border border-[rgba(90,143,255,0.3)] bg-[rgba(90,143,255,0.1)] px-2.5 py-1 text-[11px] text-[#5A8FFF]">
                {l}
                <button onClick={() => setLanguages((ll) => ll.filter((x) => x !== l))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar idioma..." value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())} />
            <Button variant="outline" size="sm" onClick={addLanguage} disabled={!langInput.trim()}>+</Button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Trayectoria</div>
          <Button variant="ghost" size="sm" onClick={addCareerEntry} className="mb-2 text-[11px]">+ Agregar</Button>
          <div className="space-y-2">
            {career.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_90px_auto] gap-1.5">
                <Input placeholder="Club" value={entry.club} onChange={(e) => updateCareer(i, 'club', e.target.value)} />
                <Input placeholder="Rol" value={entry.role} onChange={(e) => updateCareer(i, 'role', e.target.value)} />
                <Input placeholder="Anios" value={entry.years} onChange={(e) => updateCareer(i, 'years', e.target.value)} />
                <Button variant="ghost" size="sm" onClick={() => removeCareerEntry(i)} className="!px-2 text-[11px]">✕</Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Palmares</div>
          <div className="mb-2 space-y-1.5">
            {trophies.map((t, i) => (
              <div key={`${t}-${i}`} className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.6)]">
                <span>🏆</span>
                <span className="flex-1">{t}</span>
                <button onClick={() => setTrophies((tt) => tt.filter((_, idx) => idx !== i))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar logro..." value={trophyInput} onChange={(e) => setTrophyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrophy())} />
            <Button variant="outline" size="sm" onClick={addTrophy} disabled={!trophyInput.trim()}>+</Button>
          </div>
        </div>

        {error && <div className="text-[12px] text-red-400">{error}</div>}
        {saved  && <div className="text-[12px] text-[#00C853]">Guardado ✓</div>}
        <Button variant="primary" className="w-full justify-center" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
      </div>
    </SurfaceCard>
  )
}
