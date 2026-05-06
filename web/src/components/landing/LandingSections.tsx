import Image from 'next/image'
import Link from 'next/link'
import { type MouseEvent } from 'react'
import SectionHeading from './SectionHeading'

type Props = {
  ctaParallaxY: number
  onOpenModal: () => void
  onCardMove: (e: MouseEvent<HTMLElement>) => void
}

const talents = [
  { name: 'Mateo R.', role: 'Delantero', age: 19, country: 'Argentina', photo: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=600&q=80' },
  { name: 'Lucia M.', role: 'Mediocampista', age: 18, country: 'Uruguay', photo: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80' },
  { name: 'Thiago P.', role: 'Defensor', age: 20, country: 'Brasil', photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sofia G.', role: 'Delantera', age: 17, country: 'Colombia', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tomas L.', role: 'Arquero', age: 21, country: 'Chile', photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Valentina D.', role: 'Extremo', age: 16, country: 'Argentina', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80' },
]

export default function LandingSections({ ctaParallaxY, onOpenModal, onCardMove }: Props) {
  return (
    <>
      <section className="oc-shell py-24 md:py-28" id="valor" data-reveal>
        <SectionHeading title="Tu talento necesita una vidriera real." subtitle="One Chance es la plataforma profesional que conecta talento con oportunidades reales." />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Jugadores', 'Creá tu perfil, subí datos, videos y trayectoria para mostrar tu juego.'],
            ['Clubes', 'Descubri talento por edad, puesto, nacionalidad y recorrido deportivo.'],
            ['Representantes', 'Evaluá perfiles listos para analizar y conectar profesionalmente.'],
          ].map((card, index) => (
            <article key={card[0]} data-reveal className="oc-reveal oc-hover-card rounded-[14px] border border-[var(--oc-border)] bg-[var(--oc-bg-card)] px-8 py-8 text-center transition hover:-translate-y-0.5 hover:border-[var(--oc-border-hi)]" style={{ transitionDelay: `${index * 60}ms` }} onMouseMove={onCardMove}>
              <div className="oc-content-frame-tight">
                <h3 className="text-[22px] font-[700] leading-[1.08] tracking-[-0.02em]">{card[0]}</h3>
                <p className="mt-3 text-[14px] leading-[1.65] text-[var(--oc-fg-muted)]">{card[1]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="oc-shell py-14 md:py-16" data-reveal>
        <SectionHeading title="De tu perfil a una oportunidad." />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['1', 'Crea tu perfil', 'Completa tus datos y sube videos en minutos.'],
            ['2', 'Mostrá tu talento', 'Tu perfil llega a clubes y representantes.'],
            ['3', 'Gana visibilidad', 'Multiplica tus oportunidades con contactos reales.'],
          ].map((step, index) => (
            <article key={step[0]} data-reveal className="oc-reveal oc-hover-card rounded-[14px] border border-[var(--oc-border)] bg-[var(--oc-bg-card)] px-8 py-8 text-center transition hover:-translate-y-0.5 hover:border-[var(--oc-border-hi)]" style={{ transitionDelay: `${(index + 1) * 60}ms` }} onMouseMove={onCardMove}>
              <div className="oc-content-frame-tight">
                <div className="text-[64px] font-[800] leading-[0.95] tracking-[-0.05em] text-[var(--oc-lime)]">{step[0]}</div>
                <h3 className="mt-2 text-[22px] font-[700] leading-[1.1]">{step[1]}</h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-[var(--oc-fg-muted)]">{step[2]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="oc-shell py-24 md:py-28" id="talentos" data-reveal>
        <SectionHeading title="Talentos listos para ser descubiertos." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {talents.map((talent, index) => (
            <article key={talent.name} data-reveal className="oc-reveal oc-hover-card overflow-hidden rounded-[12px] border border-[var(--oc-border)] bg-[var(--oc-bg-card)] transition hover:-translate-y-0.5 hover:border-[rgba(170,255,0,0.35)]" style={{ transitionDelay: `${Math.min(index * 45, 220)}ms` }} onMouseMove={onCardMove}>
              <div className="relative aspect-[3/4]">
                <Image src={talent.photo} alt={talent.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.72)_100%)]" />
                <span className="absolute left-2 top-2 rounded-[4px] bg-[rgba(0,0,0,0.55)] px-2 py-1 text-[10px] font-[700] text-[var(--oc-lime)]">N#{index + 10}</span>
              </div>
              <div className="p-4">
                <div className="text-[15px] font-[700]">{talent.name}</div>
                <div className="mt-0.5 text-[12px] text-[var(--oc-fg-muted)]">{talent.role}</div>
                <div className="mt-2 text-[11px] text-[var(--oc-fg-dim)]">{talent.age} años · {talent.country}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--oc-border)] bg-[var(--oc-bg-surface)] py-20 md:py-24" id="ecosistema" data-reveal>
        <div className="oc-shell">
          <SectionHeading title="Un ecosistema para conectar talento y oportunidad." />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Jugadores y jugadoras', 'Mostrá tu talento, historia y proyección al mundo profesional.'],
              ['Técnicos', 'Encontrá perfiles alineados a tus necesidades deportivas.'],
              ['Clubes', 'Accede a una base de talentos filtrada y actualizada.'],
              ['Representantes', 'Evaluá y conectá con jugadores comprometidos.'],
            ].map((item, index) => (
              <article key={item[0]} data-reveal className="oc-reveal" style={{ transitionDelay: `${index * 60}ms` }}>
                <h4 className="text-[22px] font-[700] tracking-[-0.01em]">{item[0]}</h4>
                <p className="mt-3 text-[14px] leading-[1.65] text-[var(--oc-fg-muted)]">{item[1]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 text-center" id="cta" data-reveal>
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ transform: `translateY(${ctaParallaxY}px)` }}>
            <Image src="/images/cesped-pelota.png" alt="Fondo cesped y pelota" fill className="object-cover object-[center_18%] opacity-78" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.64)_0%,rgba(10,10,10,0.34)_52%,rgba(10,10,10,0.72)_100%)]" />
        </div>
        <div className="oc-shell relative z-10">
          <h2 className="mx-auto max-w-[860px] text-[clamp(38px,5.8vw,64px)] font-[800] leading-[1.06] tracking-[-0.03em]">
            Tu próxima oportunidad puede empezar con un <span className="text-[var(--oc-lime)]">perfil</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-[680px] text-[17px] leading-[1.7] text-[var(--oc-fg-muted)]">
            One Chance es el lugar donde el talento deja de estar oculto y empieza a mostrarse profesionalmente.
          </p>
          <Link
            href="/auth?tab=register"
            onClick={(e) => {
              e.preventDefault()
              onOpenModal()
            }}
            className="group mt-9 inline-flex h-[54px] items-center gap-3 rounded-[8px] bg-[var(--oc-lime)] px-8 text-[17px] font-[700] leading-none text-black transition-all hover:scale-[1.03] hover:bg-[#C4FF40] hover:shadow-[0_8px_32px_rgba(170,255,0,0.25)]"
          >
            Crear mi perfil en One Chance
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
