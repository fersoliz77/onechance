import React from "react";

const Icon = ({ name, size = 18, className = "" }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.8-3.8" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.7-4 4.4-6 8-6s6.3 2 8 6" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    calendar: (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
};

const clubs = [
  {
    name: "Boca Juniors",
    country: "Argentina",
    flag: "🇦🇷",
    city: "Buenos Aires",
    founded: "1905",
    stadium: "La Bombonera",
    capacity: "54.000 espectadores",
    division: "Primera División",
    president: "Jorge A. Amor Ameal",
    coach: "Diego Martínez",
    players: 28,
    logo: "CABJ",
    logoClass: "boca",
    bg: "linear-gradient(90deg, rgba(6,15,22,.95), rgba(12,30,50,.58)), radial-gradient(circle at 62% 18%, rgba(255,255,255,.55), transparent 4%), linear-gradient(135deg, #07101a, #0d2544 45%, #221f08)",
  },
  {
    name: "River Plate",
    country: "Argentina",
    flag: "🇦🇷",
    city: "Buenos Aires",
    founded: "1901",
    stadium: "Más Monumental",
    capacity: "84.567 espectadores",
    division: "Primera División",
    president: "Jorge Brito",
    coach: "Martín Demichelis",
    players: 26,
    logo: "CARP",
    logoClass: "river",
    bg: "linear-gradient(90deg, rgba(6,15,22,.95), rgba(21,24,29,.66)), radial-gradient(circle at 58% 20%, rgba(255,255,255,.62), transparent 4%), linear-gradient(135deg, #080b10, #222831 55%, #3b0909)",
  },
  {
    name: "FC Barcelona",
    country: "España",
    flag: "🇪🇸",
    city: "Cataluña",
    founded: "1899",
    stadium: "Spotify Camp Nou",
    capacity: "99.354 espectadores",
    division: "LaLiga",
    president: "Joan Laporta",
    coach: "Xavi Hernández",
    players: 34,
    logo: "FCB",
    logoClass: "barca",
    bg: "linear-gradient(90deg, rgba(6,15,22,.95), rgba(25,18,42,.62)), radial-gradient(circle at 58% 18%, rgba(255,255,255,.55), transparent 4%), linear-gradient(135deg, #07101a, #1a2460 45%, #4f142e)",
  },
  {
    name: "Real Madrid",
    country: "España",
    flag: "🇪🇸",
    city: "Madrid",
    founded: "1902",
    stadium: "Santiago Bernabéu",
    capacity: "81.044 espectadores",
    division: "LaLiga",
    president: "Florentino Pérez",
    coach: "Carlo Ancelotti",
    players: 30,
    logo: "RM",
    logoClass: "madrid",
    bg: "linear-gradient(90deg, rgba(6,15,22,.95), rgba(25,35,58,.62)), radial-gradient(circle at 60% 18%, rgba(255,255,255,.56), transparent 4%), linear-gradient(135deg, #07101a, #16284e 50%, #201d4b)",
  },
  {
    name: "Manchester City",
    country: "Inglaterra",
    flag: "🏴",
    city: "Manchester",
    founded: "1880",
    stadium: "Etihad Stadium",
    capacity: "53.400 espectadores",
    division: "Premier League",
    president: "Khaldoon Al Mubarak",
    coach: "Pep Guardiola",
    players: 31,
    logo: "CITY",
    logoClass: "city",
    bg: "linear-gradient(90deg, rgba(6,15,22,.95), rgba(14,36,55,.62)), radial-gradient(circle at 58% 18%, rgba(255,255,255,.55), transparent 4%), linear-gradient(135deg, #07101a, #14385d 52%, #173044)",
  },
];

const nav = ["Inicio", "Jugadores", "Técnicos", "Clubes", "Representantes", "Contacto"];

function runDataTests() {
  const names = new Set(clubs.map((club) => club.name));
  console.assert(clubs.length === 5, "Debe renderizar 5 clubes de ejemplo.");
  console.assert(names.size === clubs.length, "Los clubes no deberían repetirse.");
  console.assert(nav.includes("Clubes"), "La navegación debe incluir Clubes como sección activa.");
  console.assert(clubs.every((club) => club.name && club.country && club.division && club.players > 0), "Cada club debe tener datos mínimos visibles.");
}

runDataTests();

function SelectField({ label, value }) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-semibold text-zinc-200">{label}</label>
      <button className="flex h-9 w-full items-center justify-between rounded-md border border-white/12 bg-[#071018] px-3 text-left text-[12px] text-zinc-400 shadow-inner shadow-black/30">
        {value}
        <Icon name="chevronDown" size={15} className="text-zinc-300" />
      </button>
    </div>
  );
}

function LogoBadge({ club }) {
  return (
    <div className={`club-logo ${club.logoClass}`}>
      <span>{club.logo}</span>
    </div>
  );
}

function ClubCard({ club }) {
  const isLiga = club.division === "LaLiga" || club.division === "Premier League";

  return (
    <article className="grid min-h-[145px] grid-cols-[320px_1fr_285px_250px] overflow-hidden rounded-lg border border-white/10 bg-[#07111a]/88 shadow-[0_0_0_1px_rgba(0,0,0,.35),0_18px_50px_rgba(0,0,0,.25)]">
      <div className="relative flex items-center px-8" style={{ background: club.bg }}>
        <div className="absolute inset-0 opacity-45 stadium-lines" />
        <LogoBadge club={club} />
      </div>

      <div className="flex flex-col justify-center border-r border-white/10 px-7 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[25px] font-bold tracking-[-.04em] text-zinc-100">{club.name}</h2>
          <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-500 text-[10px] font-black text-white">✓</span>
        </div>
        <div className="mt-2 flex items-center gap-5 text-[12px] text-zinc-300">
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">{club.flag}</span>
            {club.country}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="pin" size={14} className="text-zinc-500" />
            {club.city}
          </span>
        </div>
        <div className="mt-3 space-y-1 text-[12px] leading-tight text-zinc-300">
          <p><span className="text-zinc-500">Fundación:</span> {club.founded}</p>
          <p><span className="text-zinc-500">Estadio:</span> {club.stadium}</p>
          <p><span className="text-zinc-500">Capacidad:</span> {club.capacity}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center border-r border-white/10 px-6 py-4 text-[12px]">
        <div className="grid grid-cols-[95px_1fr] items-center gap-y-5">
          <span className="text-zinc-500">División actual</span>
          <span className={`w-fit rounded-md border px-2.5 py-1 font-medium ${isLiga ? "border-purple-500/35 bg-purple-500/12 text-purple-300" : "border-blue-500/35 bg-blue-500/12 text-blue-300"}`}>{club.division}</span>
          <span className="text-zinc-500">Presidente</span>
          <span className="text-zinc-300">{club.president}</span>
          <span className="text-zinc-500">Director técnico</span>
          <span className="text-zinc-300">{club.coach}</span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 px-7 py-4 text-[12px] text-zinc-300">
        <div className="flex items-center gap-4">
          <Icon name="users" size={18} className="text-zinc-400" />
          <div>
            <p className="text-zinc-300">Jugadores en One Chance</p>
            <p className="text-[18px] font-semibold text-zinc-100">{club.players}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Icon name="shield" size={18} className="fill-lime-400 text-lime-400" />
          <span className="text-zinc-300">Perfil verificado</span>
        </div>
        <button className="ml-auto flex h-9 w-[98px] items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[.035] text-[12px] font-semibold text-zinc-200 transition hover:border-lime-400/60 hover:text-lime-300">
          Ver perfil <Icon name="arrowRight" size={15} />
        </button>
      </div>
    </article>
  );
}

export default function OneChanceClubesPage() {
  return (
    <main className="min-h-screen bg-[#030a10] text-white antialiased selection:bg-lime-400 selection:text-black">
      <style>{`
        * { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .ambient { background: radial-gradient(circle at 18% 8%, rgba(89, 189, 255, .12), transparent 26%), radial-gradient(circle at 95% 48%, rgba(151, 255, 0, .055), transparent 26%), linear-gradient(180deg, #030a10, #04121c 48%, #030a10); }
        .stadium-lines {
          background-image: repeating-linear-gradient(168deg, transparent 0 16px, rgba(255,255,255,.05) 17px, transparent 18px), linear-gradient(180deg, transparent 50%, rgba(128,255,0,.16) 100%);
          mask-image: linear-gradient(90deg, transparent, black 20%, black 70%, transparent);
        }
        .club-logo { position: relative; z-index: 2; display: grid; place-items: center; width: 92px; height: 92px; filter: drop-shadow(0 10px 20px rgba(0,0,0,.55)); }
        .club-logo span { display:grid; place-items:center; width:100%; height:100%; text-align:center; font-weight:900; letter-spacing:.04em; }
        .boca span { color:#ffd525; background:#143b93; border:5px solid #ffd525; clip-path: polygon(50% 0, 92% 18%, 82% 83%, 50% 100%, 18% 83%, 8% 18%); font-size:25px; }
        .river span { color:#111; background:linear-gradient(125deg,#fff 0 42%,#d81628 43% 57%,#fff 58%); border:4px solid #eee; clip-path: polygon(50% 0, 92% 20%, 82% 82%, 50% 100%, 18% 82%, 8% 20%); font-size:20px; }
        .barca span { color:#f5c431; background:linear-gradient(90deg,#8d1630 0 50%,#163d88 50%); border:4px solid #f5c431; clip-path: polygon(10% 0,90% 0,84% 70%,50% 100%,16% 70%); font-size:23px; }
        .madrid span { color:#224da0; background:#f8f7f0; border:5px solid #e6b72a; border-radius:50%; font-size:28px; }
        .city span { color:#163d5b; background:#d5f3ff; border:5px solid #7fc8eb; border-radius:50%; font-size:21px; }
      `}</style>

      <div className="ambient min-h-screen">
        <header className="sticky top-0 z-20 h-[68px] border-b border-white/10 bg-[#03080d]/85 backdrop-blur-xl">
          <div className="flex h-full items-center px-6">
            <div className="mr-20 w-[112px] text-[18px] font-black uppercase leading-[.78] tracking-[.08em] text-white">
              ONE<br />CHANCE
            </div>
            <nav className="flex h-full items-center gap-8 text-[13px] font-semibold text-zinc-300">
              {nav.map((item) => (
                <a key={item} href="#" className={`relative flex h-full items-center ${item === "Clubes" ? "text-lime-400" : "hover:text-white"}`}>
                  {item}
                  {item === "Clubes" && <span className="absolute bottom-[13px] left-0 h-[2px] w-full rounded-full bg-lime-400 shadow-[0_0_14px_rgba(151,255,0,.8)]" />}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-7">
              <div className="flex h-9 w-[240px] items-center rounded-md border border-white/12 bg-[#071018]/80 px-3 text-zinc-400">
                <span className="text-[13px]">Buscar clubes...</span>
                <Icon name="search" size={18} className="ml-auto text-zinc-300" />
              </div>
              <button className="flex h-9 items-center gap-9 rounded-md bg-lime-400 px-5 text-[13px] font-bold text-[#071009] shadow-[0_0_26px_rgba(151,255,0,.28)]">
                Publicar perfil <Icon name="plus" size={17} className="rounded-full border-2 border-black" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-white/35 text-zinc-200">
                <Icon name="user" size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-[252px_1fr] gap-7 px-6 py-2">
          <aside className="pt-1">
            <div className="rounded-lg border border-white/10 bg-[#061019]/90 p-4 shadow-2xl shadow-black/30">
              <div className="mb-7 flex items-center justify-between">
                <h3 className="text-[16px] font-bold">Filtros</h3>
                <Icon name="x" size={18} className="text-lime-400" />
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-200">Buscar por nombre</label>
                  <div className="flex h-9 items-center rounded-md border border-white/12 bg-[#071018] px-3 text-[12px] text-zinc-500">
                    Nombre del club...
                    <Icon name="search" size={16} className="ml-auto text-zinc-500" />
                  </div>
                </div>
                <SelectField label="País" value="Seleccionar país" />
                <SelectField label="Estado / Provincia" value="Seleccionar estado" />
                <SelectField label="División actual" value="Todas las divisiones" />
                <SelectField label="Director técnico" value="Todos" />
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-200">Fundación</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Desde','Hasta'].map((v) => (
                      <button key={v} className="flex h-9 items-center justify-between rounded-md border border-white/12 bg-[#071018] px-3 text-[12px] text-zinc-400">
                        {v}<Icon name="calendar" size={14} className="text-zinc-500" />
                      </button>
                    ))}
                  </div>
                </div>
                <button className="h-9 w-full rounded-md border border-white/15 bg-transparent text-[12px] font-semibold text-zinc-300">Limpiar filtros</button>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-lime-400/50 bg-[#07131b] p-4 text-center shadow-[0_0_35px_rgba(151,255,0,.08)]">
              <div className="mx-auto mb-4 grid h-[72px] w-full place-items-center rounded-lg bg-[radial-gradient(circle,rgba(151,255,0,.22),transparent_45%)] py-4">
                <div className="text-lime-400">
                  <svg width="70" height="58" viewBox="0 0 70 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <ellipse cx="35" cy="36" rx="25" ry="12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 36v10c0 6 11 10 25 10s25-4 25-10V36" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 30v-14m15 12V12m15 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 16l9 3-9 3m15-10l9 3-9 3m15-3l9 3-9 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-[18px] font-bold">¿Sos un club?</h3>
              <p className="mx-auto mt-2 max-w-[175px] text-[13px] leading-relaxed text-zinc-300">Creá tu perfil institucional y formá parte de One Chance.</p>
              <button className="mt-4 flex h-9 w-full items-center justify-center gap-14 rounded-md bg-lime-400 text-[13px] font-bold text-black">
                Publicar club <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </aside>

          <section className="py-4 pr-1">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h1 className="text-[31px] font-extrabold tracking-[-.05em] text-zinc-100">Clubes</h1>
                <p className="mt-1 text-[14px] text-zinc-400">Explorá clubes de fútbol de todo el mundo.</p>
              </div>
              <div className="mt-9 flex items-center gap-3 text-[12px] text-zinc-400">
                Ordenar por
                <button className="flex h-9 w-[146px] items-center justify-between rounded-md border border-white/12 bg-[#071018] px-3 text-[12px] font-semibold text-zinc-300">
                  Más relevantes <Icon name="chevronDown" size={15} />
                </button>
              </div>
            </div>
            <p className="mb-3 text-[13px] font-semibold text-zinc-200">136 clubes encontrados</p>
            <div className="space-y-2.5">
              {clubs.map((club) => <ClubCard key={club.name} club={club} />)}
            </div>
            <div className="mt-4 flex items-center justify-center gap-7 text-[14px] font-semibold text-zinc-300">
              <Icon name="chevronLeft" size={18} />
              <span className="grid h-7 w-7 place-items-center rounded-md bg-lime-400 text-black shadow-[0_0_18px_rgba(151,255,0,.38)]">1</span>
              <span>2</span><span>3</span><span>4</span><span>...</span><span>14</span>
              <Icon name="chevronRight" size={18} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
