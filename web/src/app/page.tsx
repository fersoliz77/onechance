"use client"

import Image from 'next/image'
import Link from 'next/link'
import { type MouseEvent, useEffect, useRef, useState } from 'react'
import AuthModal from '@/components/landing/AuthModal'
import HeroPlayersTicker from '@/components/landing/HeroPlayersTicker'
import LandingSections from '@/components/landing/LandingSections'
import { getPublishedPlayers } from '@/lib/firestore'
import type { PlayerProfile } from '@/types'

export default function Landing() {
  const [openModal, setOpenModal] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [heroMetrics, setHeroMetrics] = useState({ players: 0, coaches: 0, clubs: 0, agents: 0 })
  const [metricsVisible, setMetricsVisible] = useState(false)
  const [heroPlayers, setHeroPlayers] = useState<PlayerProfile[]>([])
  const [showHeroTicker, setShowHeroTicker] = useState(true)
  const metricsRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    getPublishedPlayers()
      .then((players) => setHeroPlayers(players))
      .catch(() => setHeroPlayers([]))
  }, [])

  useEffect(() => {
    if (!heroRef.current) return
    const node = heroRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setShowHeroTicker(Boolean(entry?.isIntersecting))
      },
      { threshold: 0.08 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!metricsRef.current) return
    const node = metricsRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setMetricsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!metricsVisible) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      const reducedFrame = window.requestAnimationFrame(() => {
        setHeroMetrics({ players: 1200, coaches: 84, clubs: 47, agents: 23 })
      })
      return () => window.cancelAnimationFrame(reducedFrame)
    }

    const duration = 1300
    const start = performance.now()
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = easeOut(progress)
      setHeroMetrics({
        players: Math.round(1200 * eased),
        coaches: Math.round(84 * eased),
        clubs: Math.round(47 * eased),
        agents: Math.round(23 * eased),
      })
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [metricsVisible])

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const handleCardMove = (e: MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 1024) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--mx', `${x}px`)
    e.currentTarget.style.setProperty('--my', `${y}px`)
  }

  const parallaxY = Math.min(scrollY * 0.16, 72)
  const parallaxCards = Math.min(scrollY * 0.08, 36)
  const ctaParallaxY = Math.min(Math.max((scrollY - 520) * 0.12, 0), 68)

  return (
    <main className="bg-[var(--oc-bg-base)] text-white">
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden pt-[calc(var(--oc-nav-height)+56px)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ transform: `translateY(${parallaxY}px)` }}>
            <Image src="/images/hero-stadium.png" alt="Estadio hero" fill priority className="object-cover object-[center_30%] opacity-80" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.4)_0%,rgba(10,10,10,0.14)_22%,rgba(10,10,10,0.32)_70%,#0A0A0A_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.46)_0%,rgba(10,10,10,0.14)_36%,rgba(10,10,10,0.4)_100%)]" />
        </div>

        <div className="oc-shell relative z-10 grid min-h-[calc(100svh-120px)] items-center gap-12 py-12 xl:grid-cols-[1.4fr_1fr] xl:gap-12 xl:py-16 2xl:gap-16 2xl:py-20">
          <div className="xl:self-center">
            {/* Etiqueta superior (Eyebrow) */}
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-[14px] py-1.5 text-[13px] font-[500] tracking-[0.02em] text-white/90 backdrop-blur-[4px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--oc-lime)] shadow-[0_0_0_3px_rgba(170,255,0,0.18)] animate-[oc-pulse_2.4s_infinite]" />
              Plataforma profesional de fútbol
            </div>

            {/* Titulo principal */}
            <h1 className="text-[clamp(56px,9vw,96px)] font-[800] leading-[0.92] tracking-[-0.04em] [text-shadow:0_2px_40px_rgba(0,0,0,0.6)]">
              <span className="block">ONE</span>
              <span className="block bg-[linear-gradient(180deg,#fff_0%,#d8d8d8_100%)] bg-clip-text text-transparent">CHANCE</span>
            </h1>

            {/* Subtitulo */}
            <p className="mt-4 text-[21px] italic font-[600] tracking-[-0.01em] text-[var(--oc-lime)] xl:mt-3">One opportunity can change everything.</p>
            {/* Descripcion */}
            <p className="mt-5 max-w-[480px] text-[16px] leading-[1.7] text-[var(--oc-fg-muted)] xl:mt-4">
              La vidriera profesional donde jugadores, jugadoras, clubes, técnicos y representantes se conectan con oportunidades reales.
              Mostrá tu talento con un perfil visual, ordenado y pensado para scouting.
            </p>

            {/* Botones (CTA) */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 pb-2 xl:mt-6">
              <Link
                href="/auth?tab=register"
                onClick={(e) => {
                  e.preventDefault()
                  setOpenModal(true)
                }}
                className="inline-flex h-[50px] min-w-[220px] items-center justify-center gap-2.5 rounded-[8px] bg-[var(--oc-lime)] px-6 text-[16px] font-[700] leading-none text-black transition-all hover:-translate-y-[2px] hover:bg-[#C4FF40] hover:shadow-[0_8px_32px_rgba(170,255,0,0.25)] max-sm:w-full group"
              >
                Crear mi perfil
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-[3px]">→</span>
              </Link>
              <Link href="/jugadores" className="inline-flex h-[50px] min-w-[220px] items-center justify-center rounded-[8px] border border-[var(--oc-border-hi)] bg-transparent px-6 text-[16px] font-[700] leading-none text-white transition-all hover:border-white hover:bg-[rgba(255,255,255,0.05)] max-sm:w-full">
                Explorar talentos
              </Link>
            </div>

            {/* Indicadores de ecosistema (Estadisticas) */}
            <div ref={metricsRef} className="mt-12 flex max-w-[480px] flex-wrap items-center gap-x-6 gap-y-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(160deg,rgba(255,255,255,0.03)_0%,transparent_100%)] px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[12px] sm:justify-between xl:mt-8">
              {[
                [`${(heroMetrics.players / 1000).toFixed(1)}K+`, 'Jugadores'],
                [String(heroMetrics.coaches), 'Técnicos'],
                [String(heroMetrics.clubs), 'Clubes'],
                [String(heroMetrics.agents), 'Agentes'],
              ].map((item) => (
                <div key={item[1]} className="flex flex-col items-start">
                  <div className="text-[21px] font-[800] leading-none tracking-[-0.02em] text-[var(--oc-lime)]">{item[0]}</div>
                  <div className="mt-1 text-[12px] font-[500] uppercase tracking-[0.04em] text-[var(--oc-fg-dim)]">{item[1]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha (Tarjetas 3D) */}
          <div className="relative h-[500px] w-full min-w-[280px] [perspective:1400px] xl:mx-0 xl:self-center max-lg:mx-auto max-lg:max-w-[440px]" style={{ transform: `translateY(${parallaxCards}px)` }}>
            {/* Tarjeta de Jugador Principal */}
            <article className="absolute inset-[20px_80px_60px_0] overflow-hidden rounded-[12px] border border-[rgba(170,255,0,0.28)] bg-[linear-gradient(165deg,rgba(20,35,18,0.22),rgba(15,22,18,0.3))] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(170,255,0,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] [transform:perspective(1400px)_rotateY(-6deg)_rotateX(3deg)] [transform-style:preserve-3d] [animation:oc-tilt-float_6s_ease-in-out_infinite] max-lg:inset-[30px_60px_80px_0] max-sm:inset-[30px_40px_100px_0] max-sm:p-5">
              <div className="absolute left-4 right-4 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#AAFF00,transparent)] opacity-70" />
              <div className="absolute inset-0 pointer-events-none rounded-[12px] bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,transparent_30%,transparent_70%,rgba(170,255,0,0.06)_100%)]" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-[14px]">
                  <div className="h-[56px] w-[56px] shrink-0 rounded-full bg-[#1a1a1a] bg-[url('https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80')] bg-cover bg-center shadow-[0_0_0_2px_rgba(170,255,0,0.4),0_0_0_5px_rgba(170,255,0,0.1)]" />
                  <div>
                    <div className="text-[19px] font-[700] tracking-[-0.01em]">Mateo R.</div>
                    <div className="mt-0.5 text-[14px] font-[600] text-[var(--oc-lime)]">Delantero</div>
                  </div>
                </div>

                <div className="mt-[22px] flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 rounded-[8px] border border-[rgba(170,255,0,0.14)] bg-[rgba(170,255,0,0.06)] px-3 py-2.5 text-[14px] text-[rgba(255,255,255,0.92)] backdrop-blur-[4px]">
                    <span className="text-[17px] leading-none">📅</span>19 años
                  </div>
                  <div className="flex items-center gap-3 rounded-[8px] border border-[rgba(170,255,0,0.14)] bg-[rgba(170,255,0,0.06)] px-3 py-2.5 text-[14px] text-[rgba(255,255,255,0.92)] backdrop-blur-[4px]">
                    <span className="text-[17px] leading-none">🌐</span>Argentina
                  </div>
                  <div className="flex items-center gap-3 rounded-[8px] border border-[rgba(170,255,0,0.14)] bg-[rgba(170,255,0,0.06)] px-3 py-2.5 text-[14px] text-[rgba(255,255,255,0.92)] backdrop-blur-[4px]">
                    <span className="text-[17px] leading-none">🎥</span>8 videos
                  </div>
                </div>

                <span className="mt-[14px] inline-flex items-center gap-2 rounded-full border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.1)] px-[14px] py-2 text-[13px] font-[700] tracking-[0.02em] text-[var(--oc-lime)]">
                  ✓ Perfil verificado
                </span>
              </div>
            </article>

            {/* Mini Tarjeta 1: Rendimiento */}
            <div className="absolute right-0 top-0 z-30 w-[200px] rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,22,26,0.3)] p-[14px_16px] shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[24px] [transform-style:preserve-3d] [animation:oc-tilt-soft-float_7s_ease-in-out_infinite] max-lg:right-[-10px] max-sm:right-0 max-sm:top-[-10px] max-sm:w-[170px] max-sm:p-3 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none rounded-[10px] bg-[linear-gradient(160deg,rgba(255,255,255,0.06),transparent_50%)]" />
              <div className="relative z-10">
                <div className="text-[12px] font-[500] tracking-[0.02em] text-[var(--oc-fg-muted)]">Rendimiento</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[25px] font-[800] leading-none tracking-[-0.02em]">8.7</span>
                  <span className="text-[13px] text-[var(--oc-fg-muted)]">/10</span>
                  <span className="ml-auto rounded-[4px] bg-[rgba(170,255,0,0.1)] px-1.5 py-0.5 text-[12px] font-[700] text-[var(--oc-lime)]">+12%</span>
                </div>
                <svg className="mt-2 h-[36px] w-full" viewBox="0 0 200 36" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#AAFF00" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#AAFF00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,28 L20,22 L40,25 L60,18 L80,20 L100,12 L120,15 L140,8 L160,10 L180,5 L200,2" fill="none" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,28 L20,22 L40,25 L60,18 L80,20 L100,12 L120,15 L140,8 L160,10 L180,5 L200,2 L200,36 L0,36 Z" fill="url(#sparkFill)" />
                </svg>
              </div>
            </div>

            {/* Mini Tarjeta 2: Visitas */}
            <div className="absolute bottom-[20px] right-[20px] z-30 w-[200px] rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,22,26,0.3)] p-[14px_16px] shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[24px] [transform-style:preserve-3d] [animation:oc-tilt-soft-float_7s_ease-in-out_infinite] [animation-delay:-3s] max-lg:bottom-[10px] max-lg:right-0 max-sm:bottom-0 max-sm:right-0 max-sm:w-[170px] max-sm:p-3 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none rounded-[10px] bg-[linear-gradient(160deg,rgba(255,255,255,0.06),transparent_50%)]" />
              <div className="relative z-10">
                <div className="text-[12px] font-[500] tracking-[0.02em] text-[var(--oc-fg-muted)]">Visitas al perfil</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[25px] font-[800] leading-none tracking-[-0.02em]">1.245</span>
                  <span className="ml-auto rounded-[4px] bg-[rgba(170,255,0,0.1)] px-1.5 py-0.5 text-[12px] font-[700] text-[var(--oc-lime)]">+32%</span>
                </div>
                <svg className="mt-2 h-[36px] w-full" viewBox="0 0 200 36" preserveAspectRatio="none" aria-hidden="true">
                  <g fill="#AAFF00">
                    <rect x="2" y="22" width="14" height="12" rx="1" opacity="0.5" />
                    <rect x="22" y="18" width="14" height="16" rx="1" opacity="0.55" />
                    <rect x="42" y="24" width="14" height="10" rx="1" opacity="0.5" />
                    <rect x="62" y="14" width="14" height="20" rx="1" opacity="0.65" />
                    <rect x="82" y="20" width="14" height="14" rx="1" opacity="0.55" />
                    <rect x="102" y="10" width="14" height="24" rx="1" opacity="0.75" />
                    <rect x="122" y="16" width="14" height="18" rx="1" opacity="0.65" />
                    <rect x="142" y="6" width="14" height="28" rx="1" opacity="0.85" />
                    <rect x="162" y="12" width="14" height="22" rx="1" opacity="0.75" />
                    <rect x="182" y="2" width="14" height="32" rx="1" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <HeroPlayersTicker players={heroPlayers} visible={showHeroTicker} durationSeconds={64} />
      </section>

      <LandingSections ctaParallaxY={ctaParallaxY} onOpenModal={() => setOpenModal(true)} onCardMove={handleCardMove} />

      <footer className="border-t border-[var(--oc-border)] py-8">
        <div className="oc-shell flex flex-wrap items-center justify-between gap-4 text-[14px] text-[var(--oc-fg-dim)]">
          <div>© 2026 One Chance. Todos los derechos reservados.</div>
          <div className="flex gap-4">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </footer>

      <AuthModal open={openModal} onClose={() => setOpenModal(false)} />
    </main>
  )
}
