'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SurfaceCard from '@/components/ui/SurfaceCard'
import Textarea from '@/components/ui/Textarea'
import ToastStack from '@/components/admin/ui/ToastStack'
import { useToastState } from '@/hooks/useToast'
import { COUNTRIES, POSITIONS } from '@/types'
import type { PlayerProfile } from '@/types'
import { calcPlayerCompletion } from '@/lib/completion'
import { updateProfileState } from '@/lib/rtdb'

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
    fullName:     player.fullName,
    bio:          player.bio,
    position:     player.position,
    nationality:  player.nationality,
    currentClub:  player.currentClub,
    height:       player.height,
    weight:       player.weight,
    strongFoot:   player.strongFoot,
    avatarUrl:    player.avatarUrl    ?? '',
    coverImageUrl: player.coverImageUrl ?? '',
    instagram:    player.social?.instagram ?? '',
    tiktok:       player.social?.tiktok    ?? '',
    youtube:      player.social?.youtube   ?? '',
  })
  const [chars,   setChars]   = useState<string[]>(player.characteristics ?? [])
  const [charInput, setCharInput] = useState('')
  const [langs,   setLangs]   = useState<string[]>(player.languages ?? [])
  const [langInput, setLangInput] = useState('')
  const [career,  setCareer]  = useState(player.career ?? [])
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const { toasts, toast, remove } = useToastState()

  const addChar = () => {
    const val = charInput.trim()
    if (!val || chars.includes(val)) return
    setChars(c => [...c, val])
    setCharInput('')
  }

  const addLang = () => {
    const val = langInput.trim()
    if (!val || langs.includes(val)) return
    setLangs(l => [...l, val])
    setLangInput('')
  }

  const addCareerEntry = () => setCareer(c => [...c, { club: '', years: '' }])
  const removeCareerEntry = (i: number) => setCareer(c => c.filter((_, idx) => idx !== i))
  const updateCareer = (i: number, field: 'club' | 'years', value: string) =>
    setCareer(c => c.map((e, idx) => idx === i ? { ...e, [field]: value } : e))

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const data: Partial<PlayerProfile> = {
        ...form,
        avatarUrl:    form.avatarUrl     || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        social: {
          instagram: form.instagram || undefined,
          tiktok:    form.tiktok    || undefined,
          youtube:   form.youtube   || undefined,
        },
        characteristics: chars,
        languages:       langs,
        career,
      }
      // Remove flat social keys before sending
      delete (data as Record<string, unknown>).instagram
      delete (data as Record<string, unknown>).tiktok
      delete (data as Record<string, unknown>).youtube

      await updateProfile(uid, 'player', data)
      const completionPct = calcPlayerCompletion({ ...player, ...data })
      await updateProfileState(uid, { completionPct }).catch(() => {})
      toast.success('Cambios guardados correctamente')
      onSaved({ ...player, ...data })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
      setError('')
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]'

  return (
    <SurfaceCard>
      <div className="mb-4 text-[14px] font-medium text-white">Editar perfil</div>
      <div className="flex flex-col gap-2.5">

        {/* Datos básicos */}
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} options={[{ value: '', label: 'Puesto' }, ...POSITIONS.map(p => ({ value: p, label: p }))]} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
        <Select value={form.strongFoot} onChange={e => setForm(f => ({ ...f, strongFoot: e.target.value as typeof form.strongFoot }))} options={[{ value: 'Der', label: 'Pie derecho' }, { value: 'Izq', label: 'Pie izquierdo' }, { value: 'Ambas', label: 'Ambidiestro' }]} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Altura (ej: 1.78)" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
          <Input placeholder="Peso (ej: 75)" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
        </div>
        <Input placeholder="Club actual (dejar vacío si libre)" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} />
        <Textarea placeholder="Bio / Descripción" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />

        {/* Fotos */}
        <div className={labelCls}>Fotos</div>
        <Input placeholder="URL de foto de perfil (avatar)" value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
        <Input placeholder="URL de imagen de portada (cabecera del perfil)" value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} />

        {/* Características */}
        <div>
          <div className={`mb-2 ${labelCls}`}>Características</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {chars.map(c => (
              <span key={c} className="flex items-center gap-1 rounded-[20px] border border-[rgba(0,200,83,0.3)] bg-[rgba(0,200,83,0.1)] px-2.5 py-1 text-[11px] text-[#00C853]">
                {c}
                <button onClick={() => setChars(cs => cs.filter(x => x !== c))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar característica..." value={charInput} onChange={e => setCharInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChar())} />
            <Button variant="outline" size="sm" onClick={addChar} disabled={!charInput.trim()}>+</Button>
          </div>
        </div>

        {/* Idiomas */}
        <div>
          <div className={`mb-2 ${labelCls}`}>Idiomas</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {langs.map(l => (
              <span key={l} className="flex items-center gap-1 rounded-[20px] border border-[rgba(0,200,83,0.3)] bg-[rgba(0,200,83,0.1)] px-2.5 py-1 text-[11px] text-[#00C853]">
                {l}
                <button onClick={() => setLangs(ls => ls.filter(x => x !== l))} className="cursor-pointer border-none bg-transparent text-[11px] text-current opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar idioma (ej: Español, Inglés)..." value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLang())} />
            <Button variant="outline" size="sm" onClick={addLang} disabled={!langInput.trim()}>+</Button>
          </div>
        </div>

        {/* Trayectoria */}
        <div>
          <div className={`mb-2 ${labelCls}`}>Trayectoria</div>
          <Button variant="ghost" size="sm" onClick={addCareerEntry} className="mb-2 text-[11px]">+ Agregar club</Button>
          <div className="space-y-2">
            {career.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_auto] gap-1.5">
                <Input placeholder="Club" value={entry.club} onChange={e => updateCareer(i, 'club', e.target.value)} />
                <Input placeholder="Años (ej: 2021-2023)" value={entry.years} onChange={e => updateCareer(i, 'years', e.target.value)} />
                <Button variant="ghost" size="sm" onClick={() => removeCareerEntry(i)} aria-label="Eliminar entrada" className="!px-2 text-[11px]">✕</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Redes sociales */}
        <div>
          <div className={`mb-2 ${labelCls}`}>Redes sociales</div>
          <div className="flex flex-col gap-2">
            <Input placeholder="Instagram (ej: @usuario o URL completa)" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
            <Input placeholder="TikTok (ej: @usuario o URL completa)" value={form.tiktok} onChange={e => setForm(f => ({ ...f, tiktok: e.target.value }))} />
            <Input placeholder="YouTube (URL del canal)" value={form.youtube} onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))} />
          </div>
        </div>

        {error && <div className="text-[12px] text-red-400">{error}</div>}
        <Button variant="primary" className="w-full justify-center" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
      <ToastStack toasts={toasts} onRemove={remove} />
    </SurfaceCard>
  )
}
