'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { COUNTRIES, POSITIONS } from '@/types'
import type { ClubProfile } from '@/types'

async function updateProfile(uid: string, role: 'club', data: Partial<ClubProfile>) {
  const res = await fetch(`/api/profiles/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, data }),
  })
  if (!res.ok) throw new Error('No se pudo guardar el perfil')
}

export default function ClubEditForm({ club, uid, onSaved }: { club: ClubProfile; uid: string; onSaved: (c: ClubProfile) => void }) {
  const [form, setForm] = useState({
    name:            club.name,
    country:         club.country,
    city:            club.city,
    province:        club.province,
    division:        club.division,
    president:       club.president,
    currentDirector: club.currentDirector,
    currentCoach:    club.currentCoach,
    bio:             club.bio,
    founded:         club.founded,
    imageUrl:        club.imageUrl ?? '',
  })
  const [seeking, setSeeking] = useState<string[]>(club.seeking ?? [])
  const [seekInput, setSeekInput] = useState('')
  const [achievements, setAchievements] = useState<string[]>(club.achievements ?? [])
  const [achInput, setAchInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const divisions = ['Primera Division', 'Segunda Division', 'Tercera Division', 'Liga Amateur', 'Juveniles', 'Femenino']

  const addSeeking = () => {
    const val = seekInput.trim()
    if (!val || seeking.includes(val)) return
    setSeeking((s) => [...s, val])
    setSeekInput('')
  }

  const addAchievement = () => {
    const val = achInput.trim()
    if (!val) return
    setAchievements((a) => [...a, val])
    setAchInput('')
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const data: Partial<ClubProfile> = {
        ...form,
        imageUrl: form.imageUrl || undefined,
        seeking,
        achievements,
      }
      await updateProfile(uid, 'club', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved({ ...club, ...data })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SurfaceCard>
      <div className="mb-4 text-[14px] font-medium text-white">Editar perfil del club</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre del club" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} options={[{ value: '', label: 'Pais' }, ...COUNTRIES.map((c) => ({ value: c, label: c }))]} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Ciudad" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <Input placeholder="Provincia" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} />
        </div>
        <Select value={form.division} onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))} options={[{ value: '', label: 'Division' }, ...divisions.map((d) => ({ value: d, label: d }))]} />
        <Input placeholder="Presidente" value={form.president} onChange={(e) => setForm((f) => ({ ...f, president: e.target.value }))} />
        <Input placeholder="Director deportivo" value={form.currentDirector} onChange={(e) => setForm((f) => ({ ...f, currentDirector: e.target.value }))} />
        <Input placeholder="Director tecnico" value={form.currentCoach} onChange={(e) => setForm((f) => ({ ...f, currentCoach: e.target.value }))} />
        <Input placeholder="Anio de fundacion" type="number" value={form.founded ? String(form.founded) : ''} onChange={(e) => setForm((f) => ({ ...f, founded: parseInt(e.target.value, 10) || 0 }))} />
        <Textarea placeholder="Descripcion institucional" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />

        <div className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Imagen del club</div>
        <Input placeholder="URL de imagen del club" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Posiciones buscadas</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {seeking.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-[20px] border border-[rgba(255,180,0,0.3)] bg-[rgba(255,180,0,0.1)] px-2.5 py-1 text-[11px] text-[#FFB400]">
                {s}
                <button onClick={() => setSeeking((ss) => ss.filter((x) => x !== s))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={seekInput} onChange={(e) => setSeekInput(e.target.value)} options={[{ value: '', label: 'Seleccionar posicion...' }, ...POSITIONS.map((p) => ({ value: p, label: p }))]} />
            <Button variant="outline" size="sm" onClick={addSeeking} disabled={!seekInput.trim()}>+</Button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Logros</div>
          <div className="mb-2 space-y-1.5">
            {achievements.map((a, i) => (
              <div key={`${a}-${i}`} className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.6)]">
                <span>🏆</span>
                <span className="flex-1">{a}</span>
                <button onClick={() => setAchievements((aa) => aa.filter((_, idx) => idx !== i))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar logro..." value={achInput} onChange={(e) => setAchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
            <Button variant="outline" size="sm" onClick={addAchievement} disabled={!achInput.trim()}>+</Button>
          </div>
        </div>

        {error && <div className="text-[12px] text-red-400">{error}</div>}
        {saved  && <div className="text-[12px] text-[#00C853]">Guardado ✓</div>}
        <Button variant="primary" className="w-full justify-center" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
      </div>
    </SurfaceCard>
  )
}
