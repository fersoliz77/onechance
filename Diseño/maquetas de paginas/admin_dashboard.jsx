import React from "react";

const green = "#84d900";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ type = "dot", className = "h-5 w-5" }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21h4" /></>,
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M17 11a4 4 0 0 0-1-7.8" /><path d="M22 21a6 6 0 0 0-5-5.8" /></>,
    file: <><path d="M8 3h8l4 4v14H4V3h4z" /><path d="M16 3v5h4" /><path d="M8 13h8" /><path d="M8 17h5" /></>,
    video: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 14 3-3 3 2 4-6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></>,
    shield: <><path d="M12 3 19 6v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" /><path d="m9 12 2 2 4-5" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.5" /></>,
    down: <path d="m6 9 6 6 6-6" />,
    external: <><path d="M14 5h5v5" /><path d="M10 14 19 5" /><path d="M19 14v5H5V5h5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    megaphone: <><path d="M3 11v2a2 2 0 0 0 2 2h2l3 4h2l-1-4c4-.5 7-3 9-4V5c-2 1-5 3.5-9 4H5a2 2 0 0 0-2 2z" /></>,
    image: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 15-4-4-6 6-3-3-5 5" /></>,
    flag: <><path d="M5 21V5" /><path d="M5 5c4-2 6 2 10 0 2-1 3-1 4 0v9c-4-2-6 2-10 0-2-1-3-1-4 0" /></>,
    download: <><path d="M12 3v11" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
    dots: <><circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" /></>,
    check: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12 2.5 2.5L16 9" /></>,
    dot: <circle cx="12" cy="12" r="7" />,
  };

  return <svg {...props}>{icons[type] || icons.dot}</svg>;
}

const menu = [
  ["dashboard", "Dashboard", true],
  ["user", "Perfiles", false, ["Jugadores", "Técnicos", "Clubes", "Representantes"]],
  ["users", "Usuarios"],
  ["file", "Solicitudes", false, null, "18"],
  ["video", "Videos"],
  ["file", "Reportes"],
  ["chart", "Estadísticas"],
  ["settings", "Configuración"],
  ["shield", "Auditoría"],
  ["mail", "Mensajes"],
  ["card", "Suscripciones"],
  ["shield", "Moderación"],
  ["settings", "Ajustes del sitio"],
];

const stats = [
  ["Perfiles totales", "12.458", "+18% vs. mes anterior", null, "text-[#84d900]"],
  ["Jugadores", "8.732", "+21%", "user", "text-violet-400"],
  ["Técnicos", "1.245", "+15%", "shield", "text-emerald-400"],
  ["Clubes", "420", "+12%", "briefcase", "text-cyan-400"],
  ["Representantes", "261", "+8%", "user", "text-purple-400"],
  ["Perfiles pendientes", "18", "-10%", "clock", "text-yellow-400"],
];

const pending = [
  ["Juan Torres", "Jugador", "16 años", "🇦🇷", "Argentina", "10/04/2025", "Menor de edad", "JT"],
  ["Sofía Gómez", "Jugadora", "15 años", "🇨🇴", "Colombia", "10/04/2025", "Menor de edad", "SG"],
  ["Thiago Pereira", "Jugador", "17 años", "🇧🇷", "Brasil", "09/04/2025", "Menor de edad", "TP"],
  ["Martín Rojas", "Jugador", "22 años", "🇨🇱", "Chile", "09/04/2025", "Documentación pendiente", "MR"],
  ["Club Deportivo Norte", "Club", "-", "🇺🇾", "Uruguay", "08/04/2025", "Información incompleta", "CN"],
  ["Agencia Talent Pro", "Representante", "-", "🇪🇸", "España", "08/04/2025", "Documentación pendiente", "AT"],
];

const activity = [
  ["Mateo Rodríguez", "Nuevo jugador registrado", "Hace 10 min", "MR"],
  ["Club Atlético del Sur", "Perfil actualizado", "Hace 25 min", "CS"],
  ["Lucía Martínez", "Video subido", "Hace 35 min", "LM"],
  ["Diego Martínez", "Perfil aprobado", "Hace 1 hora", "DM"],
  ["Tomás López", "Perfil pendiente de revisión", "Hace 2 horas", "TL"],
  ["Agencia Pro Sports", "Nueva representante registrada", "Hace 3 horas", "AP"],
];

function Card({ children, className = "" }) {
  return <div className={cx("rounded-lg border border-slate-700/70 bg-[#061420]/80 shadow-[0_20px_60px_rgba(0,0,0,.28)]", className)}>{children}</div>;
}

function Avatar({ text, size = "h-9 w-9" }) {
  return <div className={cx("grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#84d900] to-[#239466] text-xs font-black text-[#061420]", size)}>{text}</div>;
}

function Sparkline() {
  return (
    <svg className="absolute bottom-3 right-4 h-10 w-36 opacity-80" viewBox="0 0 150 50" fill="none">
      <path d="M0 43 C9 30 16 45 24 33 S39 18 47 30 55 45 65 20 76 8 84 28 95 35 104 18 111 26 121 20 131 15 141 2 150 12" stroke="#84df00" strokeWidth="2" />
      <path d="M0 50 L0 43 C9 30 16 45 24 33 S39 18 47 30 55 45 65 20 76 8 84 28 95 35 104 18 111 26 121 20 131 15 141 2 150 12 L150 50 Z" fill="url(#spark)" />
      <defs><linearGradient id="spark" x1="75" y1="0" x2="75" y2="50"><stop stopColor="#84df00" stopOpacity=".35"/><stop offset="1" stopColor="#84df00" stopOpacity="0"/></linearGradient></defs>
    </svg>
  );
}

function Chart() {
  const months = ["May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr"];
  const greenLine = [44, 60, 54, 60, 72, 90, 96, 82, 85, 97, 90, 98];
  const blue = [24, 30, 26, 34, 33, 36, 34, 38, 45, 47, 38, 32];
  const purple = [11, 15, 16, 14, 15, 15, 20, 20, 24, 27, 20, 17];
  const orange = [7, 8, 6, 5, 7, 6, 7, 7, 8, 7, 6, 3];
  const x = (i) => 25 + i * 49;
  const y = (v) => 180 - v * 1.35;
  const path = (data) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const dots = (data, color) => data.map((v, i) => <circle key={`${color}-${i}`} cx={x(i)} cy={y(v)} r="3.6" fill={color} />);

  return (
    <div className="relative h-full px-6 pb-5 pt-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Crecimiento de perfiles</h2>
        <div className="flex gap-3">
          <button className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-300">Últimos 12 meses ▾</button>
          <button className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-300">Exportar ▾</button>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap justify-center gap-7 text-xs text-slate-300">
        <span><b className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#84d900]" />Jugadores</span>
        <span><b className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#38a9f3]" />Técnicos</span>
        <span><b className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#7b4df0]" />Clubes</span>
        <span><b className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#ffb500]" />Representantes</span>
      </div>
      <svg className="h-[250px] w-full" viewBox="0 0 620 230" preserveAspectRatio="none">
        {[40, 85, 130, 175].map((yy) => <line key={yy} x1="25" x2="590" y1={yy} y2={yy} stroke="#243342" strokeWidth="1" />)}
        <text x="0" y="178" fill="#9aa4af" fontSize="12">0</text><text x="0" y="133" fill="#9aa4af" fontSize="12">250</text><text x="0" y="88" fill="#9aa4af" fontSize="12">500</text><text x="0" y="43" fill="#9aa4af" fontSize="12">1.000</text>
        <path d={`${path(greenLine)} L${x(greenLine.length - 1)} 180 L25 180 Z`} fill="url(#area)" />
        <path d={path(greenLine)} stroke="#84d900" strokeWidth="3" fill="none" />{dots(greenLine, "#84d900")}
        <path d={path(blue)} stroke="#38a9f3" strokeWidth="2" fill="none" />{dots(blue, "#38a9f3")}
        <path d={path(purple)} stroke="#7b4df0" strokeWidth="2" fill="none" />{dots(purple, "#7b4df0")}
        <path d={path(orange)} stroke="#ffb500" strokeWidth="2" fill="none" />{dots(orange, "#ffb500")}
        <defs><linearGradient id="area" x1="0" y1="20" x2="0" y2="180"><stop stopColor="#84d900" stopOpacity=".24"/><stop offset="1" stopColor="#84d900" stopOpacity="0"/></linearGradient></defs>
      </svg>
      <div className="absolute bottom-3 left-[76px] right-12 flex justify-between text-xs text-slate-400">{months.map((m) => <span key={m}>{m}</span>)}</div>
    </div>
  );
}

function Donut() {
  const items = [["Publicados", "10.285 (82%)", "#84d900"], ["Pendientes", "1.256 (10%)", "#ffbd14"], ["Rechazados", "512 (4%)", "#ff372d"], ["Borradores", "405 (4%)", "#94a3b8"]];
  return (
    <div className="flex h-full items-center justify-between gap-5 px-8">
      <div className="relative grid h-52 w-52 shrink-0 place-items-center rounded-full" style={{ background: "conic-gradient(#84d900 0 82%, #ffbd14 82% 92%, #ff372d 92% 96%, #94a3b8 96% 100%)" }}>
        <div className="absolute inset-5 rounded-full bg-[#071521] shadow-[inset_0_0_30px_rgba(0,0,0,.55)]" />
        <div className="relative text-center"><div className="text-sm text-slate-400">Total</div><div className="text-3xl font-semibold text-white">12.458</div></div>
      </div>
      <div className="flex-1 space-y-7 text-sm">{items.map(([a, b, c]) => <div key={a} className="flex items-center justify-between border-b border-slate-800/80 pb-2"><span className="flex items-center gap-3 text-slate-300"><span className="h-3 w-3 rounded-sm" style={{ background: c }} />{a}</span><span className="text-slate-400">{b}</span></div>)}</div>
    </div>
  );
}

function VideoThumb() {
  return <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-[linear-gradient(135deg,#162633,#17394a_45%,#275f31)]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(132,217,0,.35),transparent_36%),radial-gradient(circle_at_75%_40%,rgba(56,169,243,.25),transparent_36%)]" /><span className="absolute inset-0 grid place-items-center text-white"><span className="grid h-9 w-9 place-items-center rounded-full bg-black/30"><Icon type="play" className="h-4 w-4" /></span></span></div>;
}

export default function OneChanceAdminDashboard() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#030b12] text-slate-200" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_5%,rgba(32,132,170,.17),transparent_35%),radial-gradient(circle_at_14%_25%,rgba(131,217,0,.12),transparent_22%),linear-gradient(180deg,#02070d_0%,#061018_58%,#03070c_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[.075]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      <aside className="fixed left-0 top-0 z-10 h-screen w-[240px] border-r border-slate-800/80 bg-[#04101a]/92 px-4 py-6 backdrop-blur-xl">
        <div className="mb-8 px-3 text-2xl font-black leading-[.82] tracking-widest text-white">ONE<br />CHANCE</div>
        <nav className="space-y-1">
          {menu.map(([icon, label, active, children, badge]) => <div key={label}><div className={cx("flex h-11 items-center gap-3 rounded-md px-4 text-sm font-medium", active ? "bg-[#83d900]/17 text-[#8bea09]" : "text-slate-400 hover:bg-slate-800/50 hover:text-white")}><Icon type={icon} className="h-5 w-5" /><span className="flex-1">{label}</span>{badge && <span className="rounded bg-[#84d900] px-2 py-0.5 text-xs font-bold text-[#102100]">{badge}</span>}{children && <Icon type="down" className="h-3 w-3" />}</div>{children && <div className="ml-[30px] mt-1 border-l border-slate-800 pb-2 pl-6 text-xs text-slate-500">{children.map((c) => <div className="py-2" key={c}>{c}</div>)}</div>}</div>)}
        </nav>
        <Card className="absolute bottom-7 left-3 right-3 p-4">
          <h3 className="mb-4 text-base font-semibold text-white">Actividad en vivo</h3>
          <div className="space-y-4">{[["Nuevo jugador registrado", "Hace 2 min"], ["Video subido por Tomás L.", "Hace 5 min"], ["Perfil aprobado", "Hace 8 min"], ["Nuevo club registrado", "Hace 12 min"]].map((l, i) => <div className="flex gap-3" key={l[0]}><span className={cx("mt-1 grid h-7 w-7 place-items-center rounded-full border", i === 0 ? "border-slate-600" : i === 1 ? "border-[#84d900]/60 text-[#84d900]" : i === 2 ? "border-green-500/60 text-green-500" : "border-purple-500/60 text-purple-400")}><span className="h-2 w-2 rounded-full bg-current" /></span><div><p className="text-xs font-semibold text-slate-300">{l[0]}</p><p className="text-[11px] text-slate-500">{l[1]}</p></div></div>)}</div>
          <button className="mt-5 w-full rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">Ver todas las actividades</button>
        </Card>
      </aside>

      <main className="relative z-[1] ml-[240px] min-h-screen px-6 pb-14 pt-5">
        <header className="mb-5 flex items-center justify-between border-b border-slate-800/75 pb-5">
          <div><h1 className="text-2xl font-semibold tracking-tight text-white">Panel de administración</h1><p className="mt-1 text-sm text-slate-400">Bienvenido, Administrador. Desde aquí puedes gestionar toda la plataforma.</p></div>
          <div className="flex items-center gap-7"><Icon type="search" className="h-5 w-5 text-slate-400" /><div className="relative"><Icon type="bell" className="h-5 w-5 text-slate-400" /><span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-[#84d900] text-[10px] font-bold text-[#142900]">7</span></div><div className="h-9 w-px bg-slate-800" /><div className="text-right"><p className="text-sm font-semibold text-white">Administrador</p><p className="text-xs font-bold text-[#84d900]">Super Admin</p></div><Avatar text="AD" size="h-10 w-10" /></div>
        </header>

        <button className="absolute right-6 top-[84px] flex items-center gap-2 rounded-md border border-slate-700 bg-[#071622] px-4 py-2 text-xs text-slate-300">Ver sitio público <Icon type="external" className="h-3.5 w-3.5" /></button>

        <section className="grid grid-cols-6 gap-5 pt-1">{stats.map(([label, value, sub, icon, color], i) => <Card key={label} className="relative h-[122px] overflow-hidden p-5"><div className="text-sm font-semibold text-slate-300">{label}</div><div className="mt-2 flex items-center justify-between"><div className="text-3xl font-semibold text-white">{value}</div>{icon && <Icon type={icon} className={cx("h-10 w-10", color)} />}</div><p className={cx("mt-2 text-xs font-bold", i === 5 ? "text-green-600" : "text-[#84d900]")}>{sub}</p>{i === 0 && <Sparkline />}</Card>)}</section>

        <section className="mt-5 grid grid-cols-[1.62fr_.96fr_.96fr] gap-5">
          <Card className="h-[385px]"><Chart /></Card>
          <Card className="h-[385px]"><h2 className="px-6 pt-5 text-xl font-semibold text-white">Perfiles por estado</h2><Donut /></Card>
          <Card className="h-[385px] p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold text-white">Actividad reciente</h2><button className="text-xs font-bold text-[#84d900]">Ver todas</button></div><div className="space-y-3">{activity.map((a) => <div className="flex items-center gap-3 border-b border-slate-800 pb-3" key={a[0]}><Avatar text={a[3]} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-200">{a[0]}</p><p className="truncate text-xs text-slate-500">{a[1]}</p></div><span className="text-xs text-slate-500">{a[2]}</span></div>)}</div></Card>
        </section>

        <section className="mt-5 grid grid-cols-[2.07fr_.77fr] gap-5">
          <Card className="min-h-[530px] p-5">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold text-white">Perfiles pendientes de revisión</h2><button className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-300">Ver todos</button></div>
            <div className="mb-6 flex gap-8 text-sm"><span className="text-slate-400">Todos (18)</span><span className="border-b-2 border-[#84d900] pb-2 font-semibold text-[#84d900]">Jugadores (14)</span><span className="text-slate-400">Técnicos (2)</span><span className="text-slate-400">Clubes (1)</span><span className="text-slate-400">Representantes (1)</span></div>
            <div className="overflow-hidden rounded-md border border-slate-800"><table className="w-full border-collapse text-left text-sm"><thead className="bg-white/[.035] text-xs font-semibold text-slate-400"><tr><th className="w-10 px-3 py-3"><Icon type="check" className="h-4 w-4" /></th><th>Perfil</th><th>Tipo</th><th>Nombre</th><th>Edad</th><th>País</th><th>Fecha de registro</th><th>Motivo</th><th>Acciones</th></tr></thead><tbody>{pending.map((p) => <tr key={p[0]} className="border-t border-slate-800 text-slate-300"><td className="px-3 py-3"><span className="block h-4 w-4 rounded border border-slate-600" /></td><td className="py-3"><div className="flex items-center gap-3"><Avatar text={p[7]} size="h-8 w-8" /><span>{p[0]}</span></div></td><td>{p[1]}</td><td>{p[2]}</td><td className="text-xl">{p[3]}</td><td>{p[4]}</td><td>{p[5]}</td><td>{p[6]}</td><td><button className="mr-2 rounded bg-[#84d900] px-4 py-2 text-xs font-semibold text-[#102100]">Aprobar</button><button className="mr-2 rounded border border-slate-700 px-4 py-2 text-xs text-slate-300">Rechazar</button><button className="rounded border border-slate-700 p-2"><Icon type="eye" className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
            <div className="mt-5 flex justify-center gap-3 text-sm"><button className="rounded-md border border-slate-800 px-5 py-2 text-slate-600">Anterior</button><button className="rounded-md bg-[#84d900] px-4 py-2 font-bold text-[#102100]">1</button><button className="px-3 py-2">2</button><button className="px-3 py-2">3</button><button className="px-3 py-2">4</button><span className="px-3 py-2">...</span><button className="px-3 py-2">10</button><button className="rounded-md border border-slate-700 px-5 py-2">Siguiente</button></div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-white">Videos pendientes de revisión</h2><button className="text-xs font-bold text-[#84d900]">Ver todos</button></div>{[["Mejores jugadas 2024", "Juan Torres", "Hace 15 min"], ["Partido vs. River Plate", "Sofía Gómez", "Hace 32 min"], ["Highlights temporada", "Thiago Pereira", "Hace 45 min"]].map((v) => <div className="mb-3 flex items-center gap-3 rounded-md border border-slate-800 bg-[#071622] p-2" key={v[0]}><VideoThumb /><div className="flex-1"><p className="text-sm font-semibold text-slate-200">{v[0]}</p><p className="text-xs text-slate-500">{v[1]}</p></div><span className="text-xs text-slate-500">{v[2]}</span><Icon type="dots" className="h-4 w-4 text-slate-500" /></div>)}</Card>
            <Card className="p-5"><h2 className="mb-5 text-xl font-semibold text-white">Acciones rápidas</h2><div className="grid grid-cols-3 gap-2">{[["megaphone", "Crear anuncio"], ["mail", "Enviar mensaje"], ["download", "Exportar datos"], ["image", "Gestionar banners"], ["flag", "Ver reportes"], ["settings", "Configuración"]].map(([icon, label]) => <button key={label} className="grid h-[88px] place-items-center rounded-md border border-slate-800 bg-[#071622] text-center text-xs text-slate-300"><Icon type={icon} className="mb-2 h-7 w-7 text-slate-300" />{label}</button>)}</div></Card>
          </div>
        </section>
        <footer className="mt-6 flex border-t border-slate-800 pt-6 text-xs text-slate-500"><p className="flex-1 text-center">One Chance Admin Panel © 2025 - Todos los derechos reservados.</p><p>Versión 1.0.0</p></footer>
      </main>
    </div>
  );
}

export function runDashboardSmokeTests() {
  const required = ["Panel de administración", "Perfiles pendientes de revisión", "Actividad reciente", "Acciones rápidas"];
  return required.every(Boolean) && menu.length === 13 && pending.length === 6 && activity.length === 6;
}
