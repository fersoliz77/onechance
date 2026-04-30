import Link from 'next/link'
import Background from '@/components/layout/Background'

const stats = [
  { value: '1.2k', label: 'Jugadores' },
  { value: '84',   label: 'Técnicos' },
  { value: '47',   label: 'Clubes' },
  { value: '23',   label: 'Representantes' },
]

const roles = [
  { icon: '⚽', label: 'Jugador / Jugadora', color: '#00C853' },
  { icon: '📋', label: 'Técnico',            color: '#5A8FFF' },
  { icon: '🏟️', label: 'Club',              color: '#FFB400' },
  { icon: '🤝', label: 'Representante',      color: '#B464FF' },
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
  return (
    <div className="relative min-h-screen">
      <Background scanlines />

      <div className="relative z-[2] pt-14">
        {/* HERO */}
        <div className="max-w-[1100px] mx-auto px-7 pt-14 grid grid-cols-[1fr_44px_1fr] min-h-[520px]">

          {/* LEFT */}
          <div className="pt-2 pr-8 flex flex-col justify-start">
            <div className="inline-flex items-center gap-2 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.25)] rounded-[20px] px-[14px] py-[5px] mb-7 w-fit">
              <span className="w-[6px] h-[6px] bg-oc-green rounded-full animate-blink" />
              <span className="text-oc-green text-[10px] tracking-[0.07em]">PLATAFORMA PROFESIONAL DE FÚTBOL</span>
            </div>

            <h1 className="text-white text-[56px] font-medium leading-[0.95] tracking-[-0.04em] mb-6">
              Tu{' '}
              <span className="text-[rgba(255,255,255,0.2)]">única</span>
              <br />
              <span className="text-oc-green inline-block" style={{ transform: 'skewX(-10deg)' }}>/</span>{' '}
              oportunidad
            </h1>

            <p className="text-[rgba(255,255,255,0.35)] text-[13px] leading-[1.7] max-w-[320px] mb-9">
              La vidriera donde{' '}
              <strong className="text-[rgba(255,255,255,0.7)] font-normal">clubes, representantes y técnicos</strong>{' '}
              descubren el talento que están buscando.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <Link
                href="/auth?tab=register"
                className="bg-oc-green text-oc-green-dark text-[13px] font-medium px-[26px] py-[13px] rounded-[9px] inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,200,83,0.35)] hover:bg-oc-green-hover no-underline"
              >
                Publicar mi perfil →
              </Link>
              <Link href="/jugadores" className="text-[rgba(255,255,255,0.4)] text-[13px] flex items-center gap-1.5 transition-colors hover:text-white no-underline">
                Ver jugadores
              </Link>
            </div>

            <div className="flex gap-6">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-oc-green text-[20px] font-medium tracking-[-0.02em]">{s.value}</div>
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.06em] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER DIVIDER */}
          <div className="flex flex-col items-center py-8">
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[rgba(0,200,83,0.25)] to-transparent" />
            <div className="w-[8px] h-[8px] bg-oc-green my-2" style={{ clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' }} />
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[rgba(0,200,83,0.25)] to-transparent" />
          </div>

          {/* RIGHT — Floating cards */}
          <div className="flex flex-col items-center justify-center gap-5 relative pt-8">
            <div
              className="w-[220px] bg-gradient-to-br from-[#0C1F12] to-[#060F09] border border-[rgba(0,200,83,0.2)] p-4 animate-float"
              style={{ borderRadius:'16px 4px 16px 16px', clipPath:'polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%)' }}
            >
              <div className="h-[2px] bg-gradient-to-r from-oc-green to-transparent -mt-4 -mx-4 mb-3" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-oc-green to-oc-green-deep flex items-center justify-center text-[18px] border-[1.5px] border-[rgba(0,200,83,0.4)]">👤</div>
                <div className="flex-1">
                  <div className="text-white text-[12px] font-medium">Lucas Ferreira</div>
                  <div className="text-oc-green text-[10px] mt-0.5">Enganche</div>
                </div>
                <div className="bg-[rgba(0,200,83,0.1)] rounded-[7px] px-[8px] py-[5px] text-center">
                  <div className="text-oc-green text-[14px] font-medium leading-none">87</div>
                  <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5">OVR</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[['ARG','Nac.'],['1.78m','Alt.'],['23','Edad']].map(([v,l]) => (
                  <div key={l} className="bg-[rgba(0,200,83,0.06)] rounded-[6px] p-[6px] text-center">
                    <div className="text-oc-green text-[11px] font-medium">{v}</div>
                    <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="w-[200px] bg-[#0B1A2E] border border-[rgba(80,140,255,0.2)] p-4"
              style={{ borderRadius:'16px 4px 16px 16px', clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)', transform:'rotate(2deg)' }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-oc-blue to-[#0B1A3A] flex items-center justify-center text-[14px] border border-[rgba(90,143,255,0.35)]">📋</div>
                <div>
                  <div className="text-white text-[11px] font-medium">Martín Álvarez</div>
                  <div className="text-oc-blue text-[9px] mt-0.5">Técnico · Uruguay</div>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {['4-3-3','Ofensivo','12 años'].map(t => (
                  <span key={t} className="bg-[rgba(90,143,255,0.07)] border border-[rgba(90,143,255,0.18)] text-oc-blue text-[8px] px-[8px] py-[3px] rounded-[8px]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROLE STRIP */}
        <div className="max-w-[1100px] mx-auto px-7 mt-12 mb-10 flex items-center gap-3 overflow-x-auto">
          <span className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.07em] whitespace-nowrap mr-2">Perfiles para</span>
          {roles.map(r => (
            <Link
              key={r.label}
              href="/auth?tab=register"
              className="flex items-center gap-2 rounded-[20px] px-[14px] py-[6px] border whitespace-nowrap cursor-pointer transition-all hover:scale-[1.02] no-underline"
              style={{ background:`${r.color}0D`, borderColor:`${r.color}33` }}
            >
              <span className="text-[13px]">{r.icon}</span>
              <span className="text-[11px] font-medium" style={{ color:r.color }}>{r.label}</span>
            </Link>
          ))}
        </div>

        {/* TICKER */}
        <div className="border-t border-b border-[rgba(255,255,255,0.05)] overflow-hidden py-2.5 bg-[rgba(255,255,255,0.01)]">
          <div className="flex animate-ticker whitespace-nowrap" style={{ width:'max-content' }}>
            {[...ticker,...ticker].map((t,i) => (
              <span key={i} className="text-[rgba(255,255,255,0.25)] text-[11px] px-5">
                {t}<span className="text-oc-green mx-4">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center py-20 px-7">
          <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.1em] mb-4">Empezá ahora</div>
          <h2 className="text-white text-[36px] font-medium tracking-[-0.03em] leading-[1.1] mb-4 max-w-[500px] mx-auto">
            Creá tu perfil.<br /><span className="text-[rgba(255,255,255,0.25)]">Hacete ver.</span>
          </h2>
          <p className="text-[rgba(255,255,255,0.35)] text-[13px] mb-8 max-w-[380px] mx-auto">
            Miles de clubes, técnicos y representantes ya usan OneChance para descubrir talento.
          </p>
          <Link
            href="/auth?tab=register"
            className="inline-flex items-center gap-2 bg-oc-green text-oc-green-dark text-[13px] font-medium px-[26px] py-[13px] rounded-[9px] no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,200,83,0.35)]"
          >
            Registrarme gratis →
          </Link>
        </div>
      </div>
    </div>
  )
}
