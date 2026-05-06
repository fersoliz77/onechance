'use client'

import { useId, useRef } from 'react'
import type { PointerEvent } from 'react'
import styles from './ProPlayerCard.module.css'

type PlayerStat = {
  value: string
  label: string
}

type ProPlayerCardProps = {
  rating?: string
  name?: string
  roleText?: string
  season?: string
  imageUrl?: string
  onViewProfile?: () => void
  stats?: PlayerStat[]
  compact?: boolean
}

const defaultStats: PlayerStat[] = [
  { value: '12', label: 'GOLES' },
  { value: '7', label: 'ASISTENCIAS' },
  { value: '2.3', label: 'TIROS / PARTIDO' },
  { value: '87%', label: 'PASES COMPLETADOS' },
  { value: '3.1', label: 'PASES CLAVE' },
  { value: '1.8', label: 'OCASIONES CREADAS' },
  { value: '24', label: 'PARTIDOS' },
  { value: '1890', label: 'MINUTOS' },
  { value: '8.7', label: 'RATING PROMEDIO' },
]

export default function ProPlayerCard({
  rating = '8.7',
  name = 'Thiago Rios',
  roleText = 'Perfil verificado - One Chance Talent',
  season = '2026',
  imageUrl = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=700&q=80',
  onViewProfile,
  stats = defaultStats,
  compact = false,
}: ProPlayerCardProps) {
  const cardRef = useRef<HTMLElement | null>(null)
  const gradientId = useId()

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const xPercent = Math.min(Math.max(x / rect.width, 0), 1)
    const yPercent = Math.min(Math.max(y / rect.height, 0), 1)

    const rotateY = (xPercent - 0.5) * 36
    const rotateX = (0.5 - yPercent) * 26

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.035)`
    card.style.setProperty('--shine-x', `${xPercent * 100}%`)
    card.style.setProperty('--shine-y', `${yPercent * 100}%`)
  }

  const handlePointerLeave = () => {
    const card = cardRef.current
    if (!card) return

    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
    card.style.setProperty('--shine-x', '50%')
    card.style.setProperty('--shine-y', '50%')
  }

  return (
    <div className={`${styles.scene} ${compact ? styles.sceneCompact : ''}`}>
      <article
        ref={cardRef}
        className={styles.card}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <header className={styles.topBar}>
          <div className={styles.rating}>
            <strong className={styles.ratingValue}>{rating}</strong>
            <span className={styles.ratingLabel}>RATING PROMEDIO</span>
          </div>

          <div className={styles.clubBadge} title="Escudo del club" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 4L54 14V30C54 43.8 44.7 56.2 32 60C19.3 56.2 10 43.8 10 30V14L32 4Z" fill={`url(#${gradientId})`} />
              <path d="M32 12L45 18V30C45 39.8 39.4 48.3 32 52C24.6 48.3 19 39.8 19 30V18L32 12Z" fill="#07152F" opacity="0.72" />
              <path d="M32 18L35.5 27.2H45L37.3 33L40.3 42.5L32 36.8L23.7 42.5L26.7 33L19 27.2H28.5L32 18Z" fill="#AAFF00" />
              <defs>
                <linearGradient id={gradientId} x1="10" y1="4" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#AAFF00" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </header>

        <section className={styles.playerArea}>
          <img className={styles.playerImg} src={imageUrl} alt="Jugador de futbol profesional" />
        </section>

        <section className={styles.info}>
          <h2 className={styles.playerName}>{name}</h2>
          <p className={styles.playerRole}>{roleText}</p>
          <div className={styles.meta}>
            <span className={`${styles.pill} ${styles.pillPlayer}`}>JUGADOR</span>
            <span className={`${styles.pill} ${styles.pillClub}`}>CLUBES</span>
            <span className={`${styles.pill} ${styles.pillAgent}`}>REPRESENTANTES</span>
          </div>
        </section>

        <section className={styles.stats} aria-label="Scouting del jugador">
          {stats.slice(0, 9).map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className={styles.stat}>
              <strong className={styles.statValue}>{stat.value}</strong>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </section>

        <footer className={styles.footer}>
          <p className={styles.signature}>
            Temporada <b>{season}</b>
          </p>
          <button
            type="button"
            className={styles.cta}
            onClick={onViewProfile}
          >
            VER PERFIL COMPLETO
          </button>
        </footer>
      </article>
    </div>
  )
}
