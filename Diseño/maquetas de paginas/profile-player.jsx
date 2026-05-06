import React from "react";

const videos = [
  ["Goles & Highlights 2024", "YouTube", "02:35", "00:48", "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"],
  ["Mejores jugadas 2024", "Vimeo", "", "01:46", "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop"],
  ["Jugadas en velocidad", "TikTok", "", "00:59", "https://images.unsplash.com/photo-1598881034666-6d344705fcc3?q=80&w=600&auto=format&fit=crop"],
  ["Partido vs. River Plate", "Subido", "", "03:13", "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=600&auto=format&fit=crop"],
  ["Entrenamiento - Definición", "Subido", "", "04:26", "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=600&auto=format&fit=crop"],
  ["Todos mis goles 2023/24", "YouTube", "", "01:22", "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop"],
];

const photos = [
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
];

const navItems = ["Inicio", "Jugadores", "Técnicos", "Clubes", "Representantes", "Contacto"];
const tabs = ["Resumen", "Trayectoria", "Estadísticas", "Características", "Videos", "Fotos"];
const timelineYears = ["2024 - Actualidad", "2022 - 2024", "2020 - 2022", "2018 - 2020"];
const clubs = [
  ["Club Atlético del Sur", "Primera División", "28 partidos", "16 goles"],
  ["Deportivo Norte", "Primera División", "46 partidos", "12 goles"],
  ["Juventud Unida", "Reserva", "30 partidos", "8 goles"],
  ["Escuela de Fútbol Estrella", "Inferiores", "Formativas", ""],
];

export const oneChanceProfileTests = [
  { name: "renderiza 6 videos", pass: videos.length === 6 },
  { name: "renderiza 6 fotos", pass: photos.length === 6 },
  { name: "la pestaña activa existe", pass: tabs.includes("Resumen") },
  { name: "la navegación incluye Jugadores", pass: navItems.includes("Jugadores") },
  { name: "trayectoria y años están alineados", pass: clubs.length === timelineYears.length },
  { name: "todos los videos tienen duración visible", pass: videos.every((video) => Boolean(video[3])) },
];

function Icon({ name, className = "", size = 18 }) {
  const icons = {
    search: "⌕",
    user: "♙",
    share: "↗",
    flag: "⚑",
    bookmark: "▱",
    shield: "⬟",
    trophy: "♜",
    play: "▶",
    chevron: "⌄",
    instagram: "◎",
    pin: "◆",
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
      style={{ width: size, height: size, fontSize: size }}
    >
      {icons[name] || "•"}
    </span>
  );
}

function Shell({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-[1220px] ${className}`}>{children}</div>;
}

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-lg border border-white/10 bg-[#071418]/78 shadow-[0_0_0_1px_rgba(0,212,255,.04),0_18px_50px_rgba(0,0,0,.35)] backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 px-4 py-2 text-[12px] font-semibold text-cyan-300 shadow-[inset_0_0_20px_rgba(0,212,255,.05)]">
      {children}
    </span>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-white/10 px-4 py-3 lg:border-r lg:last:border-r-0">
      <div className="text-lime-400">{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-[12px] text-slate-400">{label}</p>
        <p className="mt-1 truncate text-[15px] font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="font-bold text-white">{title}</h3>
      {action && <a className="ml-auto text-[12px] font-bold text-lime-400">{action}</a>}
    </div>
  );
}

function Radar() {
  return (
    <div className="relative mx-auto mt-3 h-44 w-44">
      <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="rad" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#8AF20D" stopOpacity=".35" />
            <stop offset="1" stopColor="#8AF20D" stopOpacity=".06" />
          </radialGradient>
        </defs>
        {[36, 58, 80].map((r) => (
          <polygon key={r} points={`${100},${100 - r} ${100 + r * 0.86},${100 - r * 0.5} ${100 + r * 0.86},${100 + r * 0.5} ${100},${100 + r} ${100 - r * 0.86},${100 + r * 0.5} ${100 - r * 0.86},${100 - r * 0.5}`} fill="none" stroke="#8AF20D" strokeOpacity=".24" />
        ))}
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1="100" y1="100" x2={100 + 82 * Math.sin((a * Math.PI) / 180)} y2={100 - 82 * Math.cos((a * Math.PI) / 180)} stroke="#8AF20D" strokeOpacity=".18" />
        ))}
        <polygon points="100,28 158,68 158,132 100,174 52,128 54,72" fill="url(#rad)" stroke="#8AF20D" strokeWidth="3" />
        <circle cx="100" cy="100" r="4" fill="#8AF20D" />
        <text x="100" y="10" textAnchor="middle" fill="#cbd5e1" fontSize="11">Técnica</text>
        <text x="184" y="65" fill="#cbd5e1" fontSize="11">Físico</text>
        <text x="176" y="143" fill="#cbd5e1" fontSize="11">Defensa</text>
        <text x="100" y="198" textAnchor="middle" fill="#cbd5e1" fontSize="11">Pase</text>
        <text x="0" y="143" fill="#cbd5e1" fontSize="11">Velocidad</text>
        <text x="8" y="65" fill="#cbd5e1" fontSize="11">Ataque</text>
      </svg>
    </div>
  );
}

function Field() {
  return (
    <div className="relative mt-5 aspect-[1.65] rounded border border-lime-400/20 bg-[#082017] shadow-[inset_0_0_26px_rgba(138,242,13,.06)]">
      <div className="absolute inset-3 border border-lime-300/12" />
      <div className="absolute left-3 top-1/2 h-16 w-10 -translate-y-1/2 border border-lime-300/12" />
      <div className="absolute right-3 top-1/2 h-16 w-10 -translate-y-1/2 border border-lime-300/12" />
      <div className="absolute left-1/2 top-0 h-full border-l border-lime-300/12" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-300/12" />
      <div className="absolute left-[57%] top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400/80 shadow-[0_0_35px_rgba(138,242,13,.65)]">
        <span className="h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-white/80" />
      </div>
    </div>
  );
}

function VideoCard({ v, i }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#061014]">
      <div className="relative h-[96px] overflow-hidden">
        <img src={v[4]} alt={v[0]} className="h-full w-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <button className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/20" aria-label={`Reproducir ${v[0]}`}>
          <Icon name="play" size={18} />
        </button>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-[11px] font-bold">{v[3]}</span>
        {i === 0 && <span className="absolute bottom-2 left-2 rounded bg-red-600 px-2 py-1 text-[10px] font-bold">▶</span>}
      </div>
      <div className="p-3">
        <p className="truncate text-[12px] font-bold text-white">{v[0]}</p>
        <p className="mt-1 text-[11px] text-slate-400">{v[1]}</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#02080c]/86 backdrop-blur-xl">
      <Shell className="flex h-[74px] items-center gap-8">
        <div className="mr-6 leading-[.8] tracking-tight text-white">
          <div className="text-[21px] font-black">ONE</div>
          <div className="text-[21px] font-black">CHANCE</div>
        </div>
        <nav className="hidden h-full items-center gap-8 text-sm font-semibold text-slate-300 lg:flex">
          {navItems.map((n) => (
            <span key={n} className={`flex h-full items-center border-b-2 ${n === "Jugadores" ? "border-lime-400 text-lime-400" : "border-transparent"}`}>{n}</span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden h-10 w-60 items-center rounded-md border border-white/10 bg-[#061016] px-4 text-slate-500 md:flex">
            <span className="text-[12px]">Buscar jugador...</span>
            <Icon name="search" className="ml-auto" size={18} />
          </div>
          <button className="h-10 rounded-md bg-lime-400 px-5 text-[13px] font-black text-black shadow-[0_0_24px_rgba(138,242,13,.35)]">Publicar perfil</button>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/20" aria-label="Usuario"><Icon name="user" size={20} /></button>
        </div>
      </Shell>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-b-md border-x border-b border-white/10 bg-[#031016]">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2200&auto=format&fit=crop" alt="Estadio de fútbol iluminado" className="h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,8,12,.15)_24%,rgba(2,8,12,.88)_72%),linear-gradient(90deg,#02080c_0%,rgba(2,8,12,.28)_30%,rgba(2,8,12,.55)_70%,#02080c_100%)]" />
      </div>

      <div className="relative px-6 pb-6 pt-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] font-bold text-slate-400">
          <div className="flex items-center gap-3"><span className="text-white">Inicio</span><span>›</span><span>Jugadores</span><span>›</span><span>Mateo Rodríguez</span></div>
          <div className="flex gap-3">
            <button className="rounded-md border border-white/15 bg-black/35 px-4 py-2 text-lime-400"><Icon name="share" className="mr-2" size={14} />Compartir</button>
            <button className="rounded-md border border-white/15 bg-black/35 px-4 py-2"><Icon name="flag" className="mr-2" size={14} />Reportar</button>
          </div>
        </div>

        <div className="grid min-h-[345px] grid-cols-1 gap-6 pt-6 lg:grid-cols-[360px_1fr] lg:gap-8">
          <div className="relative hidden lg:block">
            <img src="https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=900&auto=format&fit=crop" alt="Retrato del jugador" className="absolute bottom-0 left-7 h-[335px] w-[286px] rounded-t-lg object-cover object-top opacity-95 drop-shadow-[0_25px_55px_rgba(0,0,0,.75)]" />
            <div className="absolute bottom-12 left-4 flex items-center gap-3 rounded-md border border-white/10 bg-[#08161a]/80 px-5 py-4 text-sm font-bold shadow-xl backdrop-blur">
              <Icon name="shield" className="text-lime-400" size={22} />Perfil verificado
            </div>
          </div>

          <div className="flex flex-col justify-center pb-2 lg:pr-8">
            <h1 className="text-[36px] font-black tracking-tight text-white md:text-[46px]">Mateo Rodríguez <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-blue-500 align-middle text-sm">✓</span></h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] font-semibold">
              <span className="text-slate-200">📂&nbsp; Delantero Centro</span>
              <span>◎ &nbsp;19 años (10/04/2005)</span>
              <span>🇦🇷 &nbsp;Argentino</span>
            </div>
            <div className="mt-8 flex items-center gap-5">
              <div className="grid h-14 w-14 place-items-center rounded-md border border-white/15 bg-white/5 text-3xl">🛡️</div>
              <div>
                <p className="text-xl font-bold text-white">Club Atlético del Sur</p>
                <p className="mt-1 text-slate-400">Primera División</p>
              </div>
            </div>
            <div className="mt-7 flex gap-4">
              <button className="h-12 w-40 rounded-md bg-lime-400 text-base font-black text-black shadow-[0_0_28px_rgba(138,242,13,.35)]">Contactar</button>
              <button className="h-12 w-40 rounded-md border border-white/25 bg-black/25 font-bold"><Icon name="bookmark" className="mr-2" size={18} />Seguir</button>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid overflow-hidden rounded-lg border border-white/12 bg-[#061318]/88 backdrop-blur-xl md:grid-cols-3 lg:-mt-2 lg:grid-cols-6">
          <Stat label="Altura" value="1.82 m" icon={<span>♙</span>} />
          <Stat label="Peso" value="76 kg" icon={<span>⚽</span>} />
          <Stat label="Pierna hábil" value="Derecha" icon={<span>◐</span>} />
          <Stat label="Categoría" value="1° División" icon={<Icon name="trophy" size={17} />} />
          <Stat label="Agente" value="Diego Martínez" icon={<Icon name="user" size={17} />} />
          <Stat label="N° de camiseta" value="9" icon={<span>9</span>} />
        </div>
      </div>
    </section>
  );
}

function Tabs() {
  return (
    <nav className="grid h-14 grid-cols-3 rounded-b-lg border-x border-b border-white/10 bg-[#061217]/95 text-center text-sm font-bold text-slate-400 md:grid-cols-6">
      {tabs.map((t, i) => <div key={t} className={`flex items-center justify-center border-b-2 ${i === 0 ? "border-lime-400 text-lime-400" : "border-transparent"}`}>{t}</div>)}
    </nav>
  );
}

function CareerSection() {
  return (
    <Card className="p-5">
      <SectionTitle title="Trayectoria" />
      <div className="mt-6 space-y-0">
        {clubs.map(([club, division, games, goals], i) => (
          <div key={club} className="grid grid-cols-[150px_1fr_120px] items-center gap-5 border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0 max-md:grid-cols-[1fr]">
            <div className="relative flex items-center gap-4 text-[13px] text-slate-400 md:before:absolute md:before:left-3 md:before:top-7 md:before:h-[calc(100%+16px)] md:before:w-[2px] md:before:bg-lime-400/50 md:last:before:hidden">
              <span className="relative z-10 h-6 w-6 rounded-full bg-lime-400 shadow-[0_0_18px_rgba(138,242,13,.8)]" />
              <span>{timelineYears[i]}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-md border border-white/10 bg-white/5 text-2xl">{i === 3 ? "🎯" : "🛡️"}</div>
              <div>
                <p className="font-bold text-white">{club}</p>
                <p className="text-[13px] text-slate-400">{division}</p>
              </div>
            </div>
            <div className="text-right text-[13px] text-slate-300 max-md:text-left">
              <p>{games}</p>
              {goals && <p className="font-bold text-white">{goals}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function OneChanceProfile() {
  return (
    <div className="min-h-screen bg-[#02080c] text-slate-200 selection:bg-lime-400 selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,212,255,.15),transparent_28%),radial-gradient(circle_at_50%_0%,rgba(138,242,13,.08),transparent_30%),linear-gradient(180deg,#02080c_0%,#031014_52%,#020609_100%)]" />
      <div className="fixed inset-0 opacity-[.08] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:42px_42px]" />

      <Header />

      <main className="relative px-4 pb-10">
        <Shell>
          <Hero />
          <Tabs />

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_300px_300px_1fr]">
              <Card className="min-h-[255px] p-5">
                <SectionTitle title="Características" />
                <div className="mt-7 flex flex-wrap gap-3"><Pill>Velocidad</Pill><Pill>Definición</Pill><Pill>Potencia</Pill><Pill>Uno contra uno</Pill><Pill>Juego aéreo</Pill><Pill>Visión de juego</Pill></div>
              </Card>
              <Card className="min-h-[255px] p-5">
                <SectionTitle title="Sobre mí" />
                <p className="mt-7 text-[13px] leading-6 text-slate-300">Delantero centro con gran olfato goleador, movilidad y capacidad para asociarse con mis compañeros. Trabajo duro cada día para seguir mejorando y cumplir mis objetivos.</p>
                <h4 className="mt-5 font-bold text-white">Idiomas</h4>
                <div className="mt-4 flex gap-12 text-[12px]"><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-lime-400"/>Español</span><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-lime-400"/>Inglés</span></div>
              </Card>
              <Card className="min-h-[255px] p-5">
                <SectionTitle title="Estadísticas generales" />
                <Radar />
              </Card>
              <Card className="min-h-[255px] p-5">
                <div className="space-y-3">
                  {[["Partidos jugados", "28"], ["Goles", "16"], ["Asistencias", "5"], ["Minutos jugados", "2.154’"], ["Tarjetas amarillas", "3"], ["Tarjetas rojas", "0"]].map(([a, b]) => <div key={a} className="flex border-b border-white/10 pb-2 text-[13px]"><span className="text-slate-400">{a}</span><b className="ml-auto text-lg text-white">{b}</b></div>)}
                  <button className="flex h-10 w-full items-center rounded-md border border-white/15 px-4 text-left text-[12px] font-bold">Temporada 2024/25 <Icon name="chevron" className="ml-auto" size={15}/></button>
                </div>
              </Card>
            </div>

            <Card className="p-5">
              <SectionTitle title="Videos destacados" action="Ver todos ↗" />
              <div className="mt-4 flex gap-7 text-[12px] font-bold"><span className="border-b-2 border-lime-400 pb-2 text-lime-400">Todos</span><span>Embebidos</span><span>Subidos</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{videos.map((v, i) => <VideoCard key={v[0]} v={v} i={i}/>)}</div>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
              <CareerSection />
              <Card className="p-5">
                <SectionTitle title="Posición en cancha" />
                <Field />
                <h4 className="mt-5 font-bold text-white">Delantero Centro</h4>
                <p className="mt-1 text-[12px] text-slate-400">Posición principal</p>
                <p className="mt-4 text-[12px] leading-5 text-slate-300">Se desempeña como delantero centro de área con movimiento, definición y buena presencia física en el juego aéreo.</p>
              </Card>
            </div>

            <Card className="p-5">
              <SectionTitle title="Fotos" action="Ver todas ↗" />
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {photos.map((p, i) => <div key={p} className="relative h-[154px] overflow-hidden rounded-lg border border-white/10"><img src={p} alt={`Foto ${i + 1} de Mateo Rodríguez`} className="h-full w-full object-cover opacity-85" />{i === 5 && <div className="absolute inset-0 grid place-items-center bg-black/55 text-3xl font-black">+24</div>}</div>)}
              </div>
            </Card>

            <Card className="p-8">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div>
                  <h2 className="text-2xl font-bold text-white">Contacto del jugador</h2>
                  <p className="mt-4 text-[13px] text-slate-400">La información de contacto es visible para usuarios registrados.</p>
                  <button className="mt-8 h-12 w-full max-w-[315px] rounded-md bg-lime-400 text-sm font-black text-black shadow-[0_0_26px_rgba(138,242,13,.35)]"><Icon name="user" className="mr-2" size={17}/>Iniciar sesión / Registrarme</button>
                </div>
                <div className="rounded-lg border border-white/10 p-5">
                  <div className="flex items-center gap-4"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Representante Diego Martínez" className="h-12 w-12 rounded-full object-cover"/><div><p className="text-[12px] text-slate-400">Representante</p><p className="font-bold text-white">Diego Martínez</p></div></div>
                  <button className="mt-6 h-11 w-full rounded-md border border-white/15 font-bold">Ver perfil</button>
                </div>
                <div className="rounded-lg border border-white/10 p-5">
                  <div className="flex items-center gap-4"><div className="text-4xl">🛡️</div><div><p className="text-[12px] text-slate-400">Club actual</p><p className="font-bold text-white">Club Atlético del Sur</p></div></div>
                  <button className="mt-6 h-11 w-full rounded-md border border-white/15 font-bold">Ver club</button>
                </div>
                <div className="rounded-lg border border-white/10 p-5">
                  <h4 className="font-bold text-white">Redes sociales</h4>
                  <div className="mt-10 flex items-center justify-around text-3xl"><Icon name="instagram" className="text-pink-400" size={32}/><span className="font-black">♪</span><span className="text-lime-400">☘</span></div>
                </div>
              </div>
            </Card>

            <div className="rounded-lg border border-white/10 bg-[#061217]/75 py-6 text-center text-sm text-slate-400"><Icon name="shield" className="mr-3 text-cyan-400" size={20}/>Este perfil fue verificado y aprobado por el equipo de One Chance.</div>
          </div>
        </Shell>
      </main>
    </div>
  );
}
