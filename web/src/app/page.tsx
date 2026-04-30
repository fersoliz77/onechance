"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import Background from '@/components/layout/Background'
import AuthModal from '@/components/landing/AuthModal'
import { PlayerCard, ClubChip, CoachCard, RepChip } from '@/components/landing/Cards'

const stats = [
  { value: '1.2k', label: 'Jugadores' },
  { value: '84',   label: 'Técnicos' },
  { value: '47',   label: 'Clubes' },
  { value: '23',   label: 'Representantes' },
]

const roles = [
  { icon: '⚽', label: 'Soy jugador / jugadora', color: '#00C853' },
  { icon: '📋', label: 'Soy técnico',            color: '#5A8FFF' },
  { icon: '🏟️', label: 'Represento un club',     color: '#FFB400' },
  { icon: '🤝', label: 'Soy representante',      color: '#B464FF' },
]

const ticker = [
  'Lucas F. · Enganche · Argentina',
  'Camila R. · Mediocampista · Uruguay',
  'Rodrigo P. · Delantero · Colombia',
  'Valentina S. · Lateral izq. · Chile',
  'Diego M. · Arquero · Brasil',
  'Sofía M. · Extremo der. · México',
]

export default function Landing() {
  const [openModal, setOpenModal] = useState(false)
  const tickerLoop = [...ticker, ...ticker, ...ticker]

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Background scanlines />
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <Image
          src="/images/estadio.png"
          alt="Estadio nocturno"
          fill
          priority
          className="object-cover opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(5,10,20,0.78)_0%,rgba(5,10,20,0.64)_38%,rgba(5,10,20,0.58)_60%,rgba(5,10,20,0.82)_100%)]" />
      </div>

      <div className="relative z-[2] min-h-screen flex flex-col pt-[calc(var(--oc-nav-height)+44px)] md:pt-[calc(var(--oc-nav-height)+56px)] pb-[10vh] md:pb-[9vh]">
        {/* HERO */}
        <div className="oc-shell grid grid-cols-1 lg:grid-cols-[1fr_44px_1fr] min-h-[calc(100vh-260px)] lg:min-h-[calc(100vh-250px)] items-center gap-8 lg:gap-0 lg:translate-y-[5vh]">

          {/* LEFT */}
          <div className="pt-2 lg:pr-8 flex flex-col justify-start max-w-[620px] justify-self-center lg:justify-self-end w-full">
            <div className="inline-flex items-center gap-2 bg-[rgba(0,200,83,0.08)] border-[0.5px] border-[rgba(0,200,83,0.25)] rounded-[20px] px-[14px] py-[5px] mb-6 w-fit animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="w-[6px] h-[6px] bg-oc-green rounded-full animate-blink" />
              <span className="text-oc-green text-[10px] tracking-[0.07em]">PLATAFORMA PROFESIONAL DE FÚTBOL</span>
            </div>

            <h1 className="text-white text-[clamp(46px,6vw,58px)] font-medium leading-[0.92] tracking-[-0.045em] mb-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Mostrá
              <br />
              tu <span className="text-oc-green inline-block" style={{ transform: 'skewX(-10deg)' }}>/</span>
              <br />
              <span className="text-transparent [text-shadow:0_0_0_rgba(255,255,255,0)] [WebkitTextStroke:1px_rgba(255,255,255,0.22)]">talento</span>
            </h1>

            <p className="text-[rgba(255,255,255,0.35)] text-[clamp(13px,1.4vw,15px)] leading-[1.65] max-w-[440px] mb-9 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              La vidriera donde{' '}
              <strong className="text-[rgba(255,255,255,0.7)] font-normal">clubes, representantes y técnicos</strong>{' '}
              descubren el talento que están buscando. Creá tu perfil. Hacete ver.
            </p>

             <div className="flex items-center gap-5 mb-0 flex-wrap animate-fade-up group" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/auth?tab=register"
                onClick={e => { e.preventDefault(); setOpenModal(true) }}
                className="h-[46px] px-6 rounded-[12px] inline-flex items-center gap-2.5 no-underline text-[13px] font-medium tracking-[-0.01em] text-[#032113] border-[0.5px] border-[rgba(145,255,194,0.55)] bg-[linear-gradient(135deg,#18f17a_0%,#00c853_52%,#00b54b_100%)] shadow-[0_10px_28px_rgba(0,200,83,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,200,83,0.45)] group-hover:block flex"
              >
                Crear mi perfil
                <span className="text-[16px] leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/jugadores" className="text-[rgba(255,255,255,0.4)] text-[13px] flex items-center gap-2 transition-colors hover:text-white no-underline">
                <span className="w-8 h-8 rounded-full border-[0.5px] border-[rgba(255,255,255,0.2)] inline-flex items-center justify-center text-[10px] text-[rgba(255,255,255,0.6)]">▶</span>
                Ver la plataforma
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 rounded-[12px] border-[0.5px] border-[rgba(255,255,255,0.1)] bg-[rgba(5,10,20,0.62)] backdrop-blur-[8px] max-w-[620px] overflow-hidden relative z-10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              {stats.map(s => (
                <div key={s.label} className="px-4 py-3.5 sm:px-[16px] sm:py-[13px] border-r-[0.5px] border-b-[0.5px] sm:border-b-0 border-[rgba(255,255,255,0.08)] last:border-r-0 even:sm:border-r-[0.5px]">
                  <div className="text-oc-green text-[clamp(24px,2.2vw,31px)] font-medium tracking-[-0.03em] leading-[0.95]">{s.value}</div>
                  <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.05em] mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER DIVIDER */}
          <div className="hidden lg:flex flex-col items-center py-8">
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[rgba(0,200,83,0.25)] to-transparent" />
            <div className="w-[8px] h-[8px] bg-oc-green my-2 shadow-[0_0_10px_rgba(0,200,83,0.6)]" style={{ clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' }} />
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[rgba(0,200,83,0.25)] to-transparent" />
          </div>

          {/* RIGHT — Floating cards */}
          <div className="flex flex-col items-center lg:items-start justify-center gap-4 sm:gap-5 relative pt-6 lg:pt-10 justify-self-center lg:justify-self-start w-full max-w-[860px]">
            <div className="flex gap-3 items-start relative z-10 lg:-translate-y-2">
              <div className="flex flex-col gap-3 lg:translate-y-4">
                <PlayerCard
                  name="Lucas Ferreira" position="Enganche" country="ARG" age="23" height="1.78m" overall="87"
                  rotate={-1} animClass="animate-float"
                />
                <ClubChip
                  name="San Lorenzo" liga="Primera División · ARG" rotate={-1}
                  animClass="animate-float" delay="-3s"
                  className="lg:ml-4"
                />
                <PlayerCard
                  name="Camila Ríos" position="Mediocampista" country="URU" age="21" height="1.70m" overall="84" avatar="⚽"
                  rotate={-1} animClass="animate-float" delay="-2.2s"
                  className="hidden md:block lg:-ml-3"
                />
              </div>

              <div className="hidden sm:flex flex-col gap-3 mt-8 lg:-ml-6">
                <CoachCard
                  name="Martín Álvarez" role="Técnico · Uruguay" tags={['4-3-3', 'Ofensivo', '12 años']} rotate={2}
                  animClass="animate-float" delay="-1s"
                />
                <RepChip
                  name="Carlos Vega" players="18" countries="5" rotate={-1}
                  animClass="animate-float" delay="-4s"
                  className="lg:ml-10"
                />
                <CoachCard
                  name="Paula Méndez" role="Técnica · Chile" tags={['Presión alta', 'Juveniles', 'UEFA B']} rotate={-2}
                  animClass="animate-float" delay="-2.8s"
                  className="lg:-ml-2"
                />
              </div>

              <div className="hidden xl:flex flex-col gap-3 mt-4 lg:-ml-8 lg:translate-y-5">
                <PlayerCard
                  name="Thiago Lima" position="Extremo" country="BRA" age="19" height="1.74m" overall="82" avatar="⚡"
                  rotate={2} animClass="animate-float" delay="-1.6s"
                  className="scale-[0.92]"
                />
                <RepChip
                  name="Lucía Torres" players="12" countries="4" rotate={1}
                  animClass="animate-float" delay="-3.5s"
                  className="lg:ml-7"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROLE STRIP */}
        <div className="fixed left-0 right-0 bottom-[64px] z-[45] pointer-events-none">
          <div className="oc-shell flex items-center justify-center gap-2.5 flex-wrap pointer-events-auto">
            {roles.map(r => (
              <Link
                key={r.label}
                href="/auth?tab=register"
                onClick={e => { e.preventDefault(); setOpenModal(true) }}
                className="flex items-center gap-2 rounded-[9px] px-[14px] py-[8px] border whitespace-nowrap cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <span className="text-[13px]">{r.icon}</span>
                <span className="text-[11px] font-medium" style={{ color:r.color }}>{r.label}</span>
                <span className="text-[rgba(255,255,255,0.2)] text-[10px]">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
      {/* TICKER */}
      <div className="fixed bottom-0 left-0 right-0 z-[40] h-[6vh] min-h-[56px] border-t border-b border-[rgba(255,255,255,0.1)] overflow-hidden bg-[rgba(3,7,14,0.9)] backdrop-blur-[2px] flex items-center">
        <div className="flex w-max animate-ticker-loop">
          {[0, 1].map(loop => (
            <div key={loop} className="flex shrink-0 whitespace-nowrap">
              {tickerLoop.map((t, i) => (
                <span key={`${loop}-${i}`} className="text-[rgba(255,255,255,0.45)] text-[clamp(10px,0.9vw,14px)] leading-[1] px-6 inline-flex items-center gap-3">
                  {i > 0 && <span className="w-[4px] h-[4px] rounded-full bg-[rgba(0,200,83,0.72)] shrink-0 mx-1" />}
                  <span className="leading-[1]">{t}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <AuthModal open={openModal} onClose={() => setOpenModal(false)} />
    </main>
  )
}
