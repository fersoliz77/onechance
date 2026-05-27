'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { storage } from '@/lib/firebase'
import { addPhoto, addVideo, getPhotos, getVideos, removePhoto, removeVideo, togglePhotoStatus, toggleVideoStatus, type PhotoEntry, updateVisibility } from '@/lib/rtdb'
import type { ProfileState, VideoEntry } from '@/types'

function youtubeThumb(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([^&?/\s]{11})/)
  return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/default.jpg` : null
}

export function VideosSection({ uid }: { uid: string }) {
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { getVideos(uid).then(v => { setVideos(v); setLoading(false) }) }, [uid])
  const detectPlatform = (u: string): VideoEntry['platform'] => u.includes('youtube') || u.includes('youtu.be') ? 'youtube' : u.includes('vimeo') ? 'vimeo' : u.includes('tiktok') ? 'tiktok' : u.includes('instagram') ? 'instagram' : null
  const handleAdd = async () => {
    if (!url.trim()) return
    setAdding(true)
    const now = new Date().toISOString()
    const payload = { type: 'embed' as const, platform: detectPlatform(url), title: title || 'Sin titulo', url, storageRef: null, status: 'hidden' as const, createdAt: now }
    const id = await addVideo(uid, payload)
    setVideos(v => [...v, { id, ...payload }])
    setUrl(''); setTitle(''); setAdding(false)
  }
  const handleRemove = async (videoId: string) => { await removeVideo(uid, videoId); setVideos(v => v.filter(x => x.id !== videoId)) }
  const handleToggle = async (v: VideoEntry) => {
    const next = v.status === 'hidden' ? 'pending' : 'hidden'
    await toggleVideoStatus(uid, v.id, next)
    setVideos(vs => vs.map(x => x.id === v.id ? { ...x, status: next } : x))
  }
  const platformIcon = (p: VideoEntry['platform']) => p === 'youtube' ? '▶' : p === 'vimeo' ? '▶' : p === 'tiktok' ? '♪' : p === 'instagram' ? '◎' : '↗'

  return (
    <SurfaceCard>
      <div className="text-white text-[14px] font-medium mb-4">Mis videos</div>
      <div className="flex flex-col gap-2 mb-4">
        <Input placeholder="URL del video (YouTube, Vimeo, TikTok...)" value={url} onChange={e => setUrl(e.target.value)} />
        <Input placeholder="Titulo del video (opcional)" value={title} onChange={e => setTitle(e.target.value)} />
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={adding || !url.trim()}>{adding ? 'Agregando...' : '+ Agregar video'}</Button>
      </div>
      {loading ? (
        <div className="text-[rgba(255,255,255,0.2)] text-[12px]">Cargando…</div>
      ) : videos.length === 0 ? (
        <div className="text-[rgba(255,255,255,0.2)] text-[12px] text-center py-4">No tenes videos agregados aun.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {videos.map(v => {
            const thumb = youtubeThumb(v.url)
            return (
              <div key={v.id} className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[9px] px-3 py-2">
                {/* Miniatura */}
                <div className="shrink-0 w-14 h-9 rounded-[5px] overflow-hidden bg-[rgba(255,255,255,0.06)] flex items-center justify-center relative">
                  {thumb ? (
                    <Image src={thumb} alt={v.title} fill className="object-cover" sizes="56px" />
                  ) : (
                    <span className="text-[14px] text-[rgba(255,255,255,0.3)]">{platformIcon(v.platform)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[13px] truncate">{v.title}</div>
                  <div className="text-[rgba(255,255,255,0.25)] text-[11px] truncate">{v.url}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => handleToggle(v)} className="text-[10px] px-2 py-1 rounded-[5px] cursor-pointer" style={{ background: v.status === 'pending' ? 'rgba(255,180,0,0.12)' : v.status === 'published' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)', color: v.status === 'pending' ? '#FFB400' : v.status === 'published' ? '#00C853' : 'rgba(255,255,255,0.35)' }}>{v.status === 'hidden' ? 'Enviar a revisión' : 'Ocultar'}</button>
                  <span className="text-[10px] px-2 py-1 rounded-[5px]" style={{ background: v.status === 'pending' ? 'rgba(255,180,0,0.12)' : v.status === 'published' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)', color: v.status === 'pending' ? '#FFB400' : v.status === 'published' ? '#00C853' : 'rgba(255,255,255,0.35)' }}>{v.status === 'pending' ? 'Pendiente' : v.status === 'published' ? 'Publicado' : 'Oculto'}</span>
                  <button onClick={() => handleRemove(v.id)} className="text-[10px] px-2 py-1 rounded-[5px] cursor-pointer bg-[rgba(255,60,60,0.08)] text-[rgba(255,60,60,0.6)]">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-3 text-[rgba(255,255,255,0.28)] text-[11px]">Al agregar, el video queda oculto. Cuando lo publiques se enviará a revisión del equipo admin.</div>
    </SurfaceCard>
  )
}

export function PhotosSection({ uid }: { uid: string }) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => { getPhotos(uid).then(p => { setPhotos(p); setLoading(false) }) }, [uid])
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Solo se permiten imagenes JPG, PNG o WebP.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5MB.'); return }
    if (photos.length >= 10) { setError('Maximo 10 fotos por perfil.'); return }
    setError(''); setUploading(true); setUploadProgress(0)
    const path = `photos/${uid}/${Date.now()}_${file.name}`
    const sRef = storageRef(storage, path)
    const task = uploadBytesResumable(sRef, file)
    task.on('state_changed', snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)), () => { setError('Error al subir la foto.'); setUploading(false) }, async () => {
      const url = await getDownloadURL(task.snapshot.ref)
      const now = new Date().toISOString()
      const id = await addPhoto(uid, { url, storagePath: path, status: 'hidden', createdAt: now })
      setPhotos(p => [...p, { id, url, storagePath: path, status: 'hidden', createdAt: now }])
      setUploading(false); setUploadProgress(0)
    })
    e.target.value = ''
  }
  const handleRemove = async (photo: PhotoEntry) => { try { await deleteObject(storageRef(storage, photo.storagePath)) } catch {} await removePhoto(uid, photo.id); setPhotos(p => p.filter(x => x.id !== photo.id)) }
  const handleTogglePhoto = async (photo: PhotoEntry) => {
    const next = photo.status === 'hidden' ? 'pending' : 'hidden'
    await togglePhotoStatus(uid, photo.id, next)
    setPhotos(ps => ps.map(p => p.id === photo.id ? { ...p, status: next } : p))
  }
  return <SurfaceCard><div className="flex items-center justify-between mb-4"><div className="text-white text-[14px] font-medium">Fotos del perfil</div><span className="text-[rgba(255,255,255,0.25)] text-[11px]">{photos.length}/10</span></div>{loading ? <div className="text-[rgba(255,255,255,0.2)] text-[12px]">Cargando…</div> : <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">{photos.map(p => <div key={p.id} className="relative group aspect-square rounded-[9px] overflow-hidden border border-[rgba(255,255,255,0.08)]"><Image src={p.url} alt="Foto de perfil" fill className="object-cover" sizes="(max-width: 640px) 33vw, 25vw" /><div className="absolute left-1.5 top-1.5 text-[10px] px-1.5 py-0.5 rounded-[5px]" style={{ background: p.status === 'pending' ? 'rgba(255,180,0,0.14)' : p.status === 'published' ? 'rgba(0,200,83,0.14)' : 'rgba(255,255,255,0.12)', color: p.status === 'pending' ? '#FFB400' : p.status === 'published' ? '#00C853' : 'rgba(255,255,255,0.7)' }}>{p.status === 'pending' ? 'Pendiente' : p.status === 'published' ? 'Publicada' : 'Oculta'}</div><div className="absolute inset-x-0 bottom-0 flex gap-1.5 p-1.5 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.7))] opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleTogglePhoto(p)} className="flex-1 text-[10px] px-2 py-1 rounded-[5px] cursor-pointer border-none" style={{ background: p.status === 'hidden' ? 'rgba(255,180,0,0.2)' : 'rgba(255,255,255,0.16)', color: p.status === 'hidden' ? '#FFB400' : '#fff' }}>{p.status === 'hidden' ? 'Enviar' : 'Ocultar'}</button><button onClick={() => handleRemove(p)} className="text-[10px] px-2 py-1 rounded-[5px] cursor-pointer border-none bg-[rgba(255,60,60,0.2)] text-[rgba(255,120,120,0.95)]" title="Eliminar foto">✕</button></div></div>)}{photos.length < 10 && <label className="aspect-square rounded-[9px] border-2 border-dashed border-[rgba(255,255,255,0.12)] flex flex-col items-center justify-center text-[rgba(255,255,255,0.25)] text-[12px] cursor-pointer hover:border-[rgba(255,255,255,0.25)] transition-colors">{uploading ? <div className="text-center px-2"><div className="text-[15px] mb-1">{uploadProgress}%</div><div className="text-[10px]">Subiendo…</div></div> : <><span className="text-[25px] leading-none mb-1">+</span><span>Subir foto</span></>}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={uploading} /></label>}</div>}{error && <div className="text-[rgba(255,60,60,0.8)] text-[12px] mt-1">{error}</div>}<div className="text-[rgba(255,255,255,0.22)] text-[11px]">Al subir, la foto queda oculta. Publicarla la envía a revisión admin. · Max. 10 fotos · JPG, PNG o WebP · hasta 5MB cada una</div></SurfaceCard>
}

export function SettingsSection({ uid, state, onStateChange }: { uid: string; state: ProfileState | null; onStateChange: (s: ProfileState) => void }) {
  const [saving, setSaving] = useState<string | null>(null)
  const vis = state?.visibility ?? { showContact: false, featured: false, notifications: true }
  const toggle = async (key: keyof typeof vis) => {
    if (!state) return
    setSaving(key)
    const newVis = { ...vis, [key]: !vis[key] }
    await updateVisibility(uid, newVis)
    onStateChange({ ...state, visibility: newVis })
    setSaving(null)
  }
  const settings: { key: keyof typeof vis; label: string; desc: string }[] = [
    { key: 'showContact', label: 'Visibilidad del contacto', desc: 'Muestra el boton "Contactar" en tu perfil publico.' },
    { key: 'notifications', label: 'Notificaciones por email', desc: 'Recibi alertas cuando alguien te contacte o tu perfil sea aprobado.' },
  ]
  return <SurfaceCard><div className="text-white text-[14px] font-medium mb-4">Configuracion</div><div className="space-y-3">{settings.map(s => <div key={s.key} className="flex items-start justify-between gap-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0"><div><div className="text-[13px] text-[rgba(255,255,255,0.75)]">{s.label}</div><div className="text-[11px] text-[rgba(255,255,255,0.3)] mt-0.5 leading-[1.5]">{s.desc}</div></div><button onClick={() => toggle(s.key)} disabled={saving === s.key} className="shrink-0 mt-0.5 w-9 h-5 rounded-full relative transition-all duration-200 cursor-pointer border-none" style={{ background: vis[s.key] ? 'rgba(0,200,83,0.28)' : 'rgba(255,255,255,0.08)', border: vis[s.key] ? '1px solid rgba(0,200,83,0.4)' : '1px solid rgba(255,255,255,0.12)', opacity: saving === s.key ? 0.5 : 1 }} title={vis[s.key] ? 'Desactivar' : 'Activar'}><span className="absolute top-[2px] h-[12px] w-[12px] rounded-full transition-all duration-200" style={{ left: vis[s.key] ? 'calc(100% - 14px)' : '2px', background: vis[s.key] ? '#00C853' : 'rgba(255,255,255,0.35)' }} /></button></div>)}</div><div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)]"><div className="text-[rgba(255,255,255,0.3)] text-[11px] uppercase tracking-[0.07em] mb-2">Cuenta</div><Button variant="ghost" size="sm" className="w-full justify-start text-[12px] text-[rgba(255,60,60,0.6)] hover:text-[#FF6060]" onClick={() => { if (window.confirm('Estas seguro de que queres cerrar sesion?')) { import('@/lib/auth').then(({ logout }) => logout().then(() => { window.location.href = '/' })) } }}>Cerrar sesion</Button></div></SurfaceCard>
}
