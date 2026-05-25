'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { VideoEntry } from '@/types'

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([^&?/\s]{11})/)
  return m?.[1] ?? null
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m?.[1] ?? null
}

function getEmbedUrl(video: VideoEntry): string | null {
  const url = video.url ?? ''
  if (video.platform === 'youtube') {
    const id = youtubeId(url)
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
  }
  if (video.platform === 'vimeo') {
    const id = vimeoId(url)
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null
  }
  return null
}

function getThumbnailUrl(video: VideoEntry): string | null {
  if (video.platform === 'youtube' && video.url) {
    const id = youtubeId(video.url)
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
  }
  return null
}

const PLATFORM_BG: Record<string, string> = {
  vimeo:     'linear-gradient(135deg, rgba(26,183,234,0.18), rgba(0,0,0,0.6))',
  tiktok:    'linear-gradient(135deg, rgba(255,0,80,0.15), rgba(0,0,0,0.6))',
  instagram: 'linear-gradient(135deg, rgba(225,48,108,0.15), rgba(253,162,29,0.1))',
}

const PLATFORM_ICON: Record<string, string> = {
  youtube:   '▶',
  vimeo:     '▶',
  tiktok:    '♪',
  instagram: '◎',
}

function VideoModal({ video, onClose }: { video: VideoEntry; onClose: () => void }) {
  const embed = getEmbedUrl(video)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[760px] rounded-[14px] overflow-hidden shadow-[0_32px_96px_rgba(0,0,0,0.8)]"
        style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)]">
          <p className="text-[13px] text-[rgba(255,255,255,0.65)] truncate pr-2">{video.title}</p>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer border-none bg-transparent text-[14px]"
          >
            ✕
          </button>
        </div>
        {embed ? (
          <div className="aspect-video w-full">
            <iframe
              src={embed}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-[rgba(255,255,255,0.03)]">
            <p className="text-[14px] text-[rgba(255,255,255,0.4)]">Este video no se puede reproducir aquí.</p>
            <a
              href={video.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[var(--oc-accent)] hover:underline"
            >
              Ver en {video.platform ?? 'sitio externo'} →
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default function VideoCard({ video }: { video: VideoEntry }) {
  const [open, setOpen] = useState(false)
  const thumb = getThumbnailUrl(video)
  const canEmbed = !!getEmbedUrl(video)
  const icon = PLATFORM_ICON[video.platform ?? ''] ?? '↗'
  const bgStyle = PLATFORM_BG[video.platform ?? ''] ?? 'rgba(255,255,255,0.04)'

  function handleClick() {
    if (canEmbed) {
      setOpen(true)
    } else {
      window.open(video.url ?? '#', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="group relative w-full overflow-hidden rounded-[12px] border border-[var(--oc-border)] text-left cursor-pointer bg-transparent p-0 hover:border-[rgba(170,255,0,0.35)] transition-all duration-200 hover:-translate-y-[1px]"
      >
        {/* Thumbnail area */}
        <div
          className="relative aspect-video w-full overflow-hidden"
          style={{ background: bgStyle }}
        >
          {thumb ? (
            <Image
              src={thumb}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[40px] opacity-25">{icon}</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.3)] group-hover:bg-[rgba(0,0,0,0.18)] transition-colors duration-200" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full border border-[rgba(255,255,255,0.5)] bg-[rgba(0,0,0,0.55)] backdrop-blur-sm flex items-center justify-center text-white text-[15px] transition-all duration-200 group-hover:scale-[1.12] group-hover:border-white group-hover:bg-[rgba(0,0,0,0.7)] pl-[2px]">
              {canEmbed ? '▶' : '↗'}
            </div>
          </div>
        </div>
        {/* Info */}
        <div className="px-3 py-2.5 bg-[rgba(0,0,0,0.3)]">
          <p className="truncate text-[13px] font-semibold text-white leading-snug">{video.title}</p>
          <p className="mt-0.5 text-[11px] capitalize text-[rgba(255,255,255,0.3)]">
            {video.platform ?? 'enlace'}
            {!canEmbed && <span className="ml-1">· abre en nueva pestaña</span>}
          </p>
        </div>
      </button>

      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </>
  )
}
