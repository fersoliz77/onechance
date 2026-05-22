'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import { COUNTRIES, POSITIONS } from '@/types'
import type { PlayerProfile } from '@/types'

async function updateProfile(uid: string, role: 'player', data: Partial<PlayerProfile>) {
  const res = await fetch(`/api/profiles/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, data }),
  })
  if (!res.ok) throw new Error('No se pudo guardar el perfil')
}

export default function PlayerEditForm({ player, uid, onSaved }: { player: PlayerProfile; uid: string; onSaved: (p: PlayerProfile) => void }) {
  const [form, setForm] = useState({
    fullName: player.fullName,
    bio: player.bio,
    position: player.position,
    nationality: player.nationality,
    currentClub: player.currentClub,
    height: player.height,
    weight: player.weight,
    strongFoot: player.strongFoot,
  })
  const [charInput, setCharInput] = useState('')
  const [chars, setChars] = useState<string[]>(player.characteristics ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addChar = () => {
    const val = charInput.trim()
    if (!val || chars.includes(val)) return
    setChars((c) => [...c, val])
    setCharInput('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const data = { ...form, characteristics: chars } as Partial<PlayerProfile>
      await updateProfile(uid, 'player', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved({ ...player, ...data } as PlayerProfile)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SurfaceCard>
      <div className="mb-4 text-[14px] font-medium text-white">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} options={[{ value: '', label: 'Puesto' }, ...POSITIONS.map((p) => ({ value: p, label: p }))]} />
        <Select value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map((c) => ({ value: c, label: c }))]} />
        <Select value={form.strongFoot} onChange={(e) => setForm((f) => ({ ...f, strongFoot: e.target.value as typeof form.strongFoot }))} options={[{ value: 'Der', label: 'Pie derecho' }, { value: 'Izq', label: 'Pie izquierdo' }, { value: 'Ambas', label: 'Ambidiestro' }]} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Altura (ej: 1.78)" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} />
          <Input placeholder="Peso (ej: 75)" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
        </div>
        <Input placeholder="Club actual (dejar vacio si libre)" value={form.currentClub} onChange={(e) => setForm((f) => ({ ...f, currentClub: e.target.value }))} />
        <Textarea placeholder="Bio / Descripcion" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Caracteristicas</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {chars.map((c) => (
              <span key={c} className="flex items-center gap-1 rounded-[20px] border border-[rgba(0,200,83,0.3)] bg-[rgba(0,200,83,0.1)] px-2.5 py-1 text-[11px] text-[#00C853]">
                {c}
                <button onClick={() => setChars((cs) => cs.filter((x) => x !== c))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar caracteristica..." value={charInput} onChange={(e) => setCharInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChar())} />
            <Button variant="outline" size="sm" onClick={addChar} disabled={!charInput.trim()}>+</Button>
          </div>
        </div>
        {saved ? <div className="text-[12px] text-[#00C853]">Guardado ✓</div> : null}
        <Button variant="primary" className="w-full justify-center" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
      </div>
    </SurfaceCard>
  )
}
