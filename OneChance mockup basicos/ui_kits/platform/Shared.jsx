// Shared.jsx — One Chance platform atoms + mock data

// ── MOCK DATA ──────────────────────────────────────────────
const MOCK_PLAYERS = [
  { id: 1, fullName: 'Lucas Ferreira', age: 23, birthDate: '2001-03-15', gender: 'M', nationality: 'Argentina', position: 'Enganche', strongFoot: 'Der', height: '1.78', weight: '72', currentClub: 'San Lorenzo', ageRange: '23-30', status: 'published', isFeatured: true, overall: 87, bio: 'Enganche técnico con excelente visión de juego. Formado en las inferiores de San Lorenzo.', career: [{club:'San Lorenzo',years:'2022-act.'},{club:'Almagro',years:'2020-2022'},{club:'San Lorenzo (inf.)',years:'2015-2020'}], characteristics: ['Visión de juego','Regate','Pase filtrado','Juego aéreo'], photos: 3, videos: 2 },
  { id: 2, fullName: 'Camila Ríos', age: 21, birthDate: '2003-07-22', gender: 'F', nationality: 'Uruguay', position: 'Mediocampista', strongFoot: 'Izq', height: '1.65', weight: '58', currentClub: 'Peñarol (F)', ageRange: '18-22', status: 'published', isFeatured: false, overall: 84, bio: 'Mediocampista de gran físico y recuperación. Capitana de la selección sub-23 de Uruguay.', career: [{club:'Peñarol (F)',years:'2021-act.'},{club:'Nacional (F)',years:'2019-2021'}], characteristics: ['Recuperación','Presión alta','Distribución','Liderazgo'], photos: 4, videos: 1 },
  { id: 3, fullName: 'Diego Méndez', age: 28, birthDate: '1996-11-08', gender: 'M', nationality: 'Brasil', position: 'Arquero', strongFoot: 'Der', height: '1.90', weight: '85', currentClub: 'Libre', ageRange: '23-30', status: 'published', isFeatured: false, overall: 79, bio: 'Arquero experimentado con pasaje por ligas de Brasil y Paraguay. Disponible para propuestas.', career: [{club:'Sport Recife',years:'2018-2023'},{club:'Olimpia',years:'2015-2018'}], characteristics: ['Salida aérea','Penales','Comunicación','Reflejos'], photos: 2, videos: 3 },
  { id: 4, fullName: 'Valentina Soto', age: 19, birthDate: '2005-02-14', gender: 'F', nationality: 'Chile', position: 'Lateral izquierdo', strongFoot: 'Izq', height: '1.62', weight: '55', currentClub: 'Colo-Colo (F)', ageRange: '18-22', status: 'published', isFeatured: false, overall: 82, bio: 'Lateral ofensiva con gran proyección. Convocada a la selección femenina mayor de Chile con solo 18 años.', career: [{club:'Colo-Colo (F)',years:'2023-act.'},{club:'Audax (F)',years:'2022-2023'}], characteristics: ['Proyección ofensiva','Centro','Velocidad','Marca'], photos: 5, videos: 2 },
  { id: 5, fullName: 'Rodrigo Paredes', age: 25, birthDate: '1999-06-30', gender: 'M', nationality: 'Colombia', position: 'Delantero', strongFoot: 'Der', height: '1.80', weight: '76', currentClub: 'Deportivo Cali', ageRange: '23-30', status: 'published', isFeatured: true, overall: 86, bio: 'Delantero goleador. 18 goles en la última temporada del fútbol colombiano.', career: [{club:'Deportivo Cali',years:'2022-act.'},{club:'Jaguares FC',years:'2020-2022'},{club:'Junior',years:'2018-2020'}], characteristics: ['Definición','Remate de cabeza','Movimiento sin pelota','Potencia'], photos: 3, videos: 4 },
  { id: 6, fullName: 'Ana Lima', age: 16, birthDate: '2008-09-05', gender: 'F', nationality: 'Paraguay', position: 'Defensa', strongFoot: 'Der', height: '1.68', weight: '62', currentClub: 'Olimpia (F)', ageRange: '13-17', status: 'pending', isFeatured: false, overall: 74, bio: 'Defensora central con gran temperamento. Seleccionada sub-17 de Paraguay.', career: [{club:'Olimpia (F)',years:'2024-act.'}], characteristics: ['Marca','Anticipación','Juego aéreo'], photos: 2, videos: 0 },
  { id: 7, fullName: 'Matías Vega', age: 20, birthDate: '2004-12-20', gender: 'M', nationality: 'Argentina', position: 'Volante', strongFoot: 'Der', height: '1.74', weight: '68', currentClub: 'Independiente', ageRange: '18-22', status: 'draft', isFeatured: false, overall: 78, bio: 'Volante mixto con buen manejo y llegada al gol. Producto de inferiores de Independiente.', career: [{club:'Independiente',years:'2024-act.'},{club:'Independiente (inf.)',years:'2018-2024'}], characteristics: ['Box to box','Disparo de media distancia','Recuperación'], photos: 1, videos: 1 },
  { id: 8, fullName: 'Sofía Morales', age: 24, birthDate: '2000-04-11', gender: 'F', nationality: 'México', position: 'Extremo derecho', strongFoot: 'Izq', height: '1.60', weight: '54', currentClub: 'Tigres UANL (F)', ageRange: '23-30', status: 'published', isFeatured: false, overall: 85, bio: 'Extrema veloz y desequilibrante. Internacional con la selección femenina de México en Copa Oro.', career: [{club:'Tigres UANL (F)',years:'2022-act.'},{club:'Cruz Azul (F)',years:'2020-2022'}], characteristics: ['Velocidad','Regate 1v1','Centro','Presión'], photos: 4, videos: 3 },
];

const MOCK_COACHES = [
  { id: 1, fullName: 'Martín Álvarez', nationality: 'Uruguay', age: 48, currentClub: 'Libre', years: 12, skills: ['Fútbol ofensivo','4-3-3','Desarrollo de jóvenes'], languages: ['Español','Portugués'], status: 'published' },
  { id: 2, fullName: 'Patricia Gómez', nationality: 'Argentina', age: 38, currentClub: 'UAI Urquiza (F)', years: 6, skills: ['Fútbol femenino','3-5-2','Alta presión'], languages: ['Español'], status: 'published' },
];

const MOCK_CLUBS = [
  { id: 1, name: 'Unión Deportiva Norte', country: 'Argentina', city: 'Rosario', division: 'Primera C', president: 'Eduardo Blanco', currentCoach: 'Jorge Reyes', seeking: ['Delantero','Lateral D'], status: 'published' },
];

const STATUS_COLORS = {
  published: { bg: 'rgba(0,200,83,0.1)', border: 'rgba(0,200,83,0.3)', color: '#00C853', label: 'Publicado' },
  pending:   { bg: 'rgba(255,180,0,0.1)', border: 'rgba(255,180,0,0.3)', color: '#FFB400', label: 'Pendiente' },
  draft:     { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', label: 'Borrador' },
  rejected:  { bg: 'rgba(255,60,60,0.1)', border: 'rgba(255,60,60,0.3)', color: '#FF3C3C', label: 'Rechazado' },
  hidden:    { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)', label: 'Oculto' },
};

const POSITIONS = ['Arquero','Defensa','Lateral derecho','Lateral izquierdo','Volante','Mediocampista central','Extremo derecho','Extremo izquierdo','Enganche','Delantero','Segundo delantero','Marcador central','Carrilero'];
const COUNTRIES = ['Argentina','Uruguay','Brasil','Chile','Colombia','Paraguay','México','Perú','Ecuador','Bolivia','Venezuela'];

// ── SHARED ATOMS ──────────────────────────────────────────

function OcBackground({ subtle = false }) {
  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:0, background:'#050A14' }} />
      <div style={{ position:'fixed', inset:0, zIndex:1, backgroundImage:'linear-gradient(rgba(0,200,83,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,83,0.025) 1px,transparent 1px)', backgroundSize:'48px 48px', animation:'oc-grid 24s linear infinite', pointerEvents:'none' }} />
      {!subtle && <>
        <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'rgba(0,200,83,0.06)', filter:'blur(100px)', top:-100, left:-80, animation:'oc-pulse 7s ease-in-out infinite', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'fixed', width:260, height:260, borderRadius:'50%', background:'rgba(0,100,255,0.05)', filter:'blur(80px)', bottom:60, right:-40, animation:'oc-pulse 9s ease-in-out infinite reverse', pointerEvents:'none', zIndex:1 }} />
      </>}
    </>
  );
}

function OcButton({ children, variant='primary', onClick, style={}, size='md', disabled=false }) {
  const [hov, setHov] = React.useState(false);
  const base = { fontFamily:'inherit', cursor: disabled ? 'not-allowed' : 'pointer', border:'none', display:'inline-flex', alignItems:'center', gap:8, transition:'all 0.18s', fontWeight:500, letterSpacing:'-0.01em', opacity: disabled ? 0.5 : 1 };
  const sz = size === 'sm' ? { fontSize:11, padding:'6px 14px', borderRadius:7 } : size === 'lg' ? { fontSize:14, padding:'13px 28px', borderRadius:10 } : { fontSize:12, padding:'9px 18px', borderRadius:8 };
  const variants = {
    primary: { background: hov && !disabled ? '#00E660' : '#00C853', color:'#002A12', boxShadow: hov && !disabled ? '0 8px 24px rgba(0,200,83,0.35)' : 'none', transform: hov && !disabled ? 'translateY(-1px)' : 'none' },
    ghost:   { background:'transparent', color: hov ? '#fff' : 'rgba(255,255,255,0.45)', border:'none' },
    outline: { background:'transparent', border:`0.5px solid ${hov ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`, color: hov ? '#fff' : 'rgba(255,255,255,0.55)' },
    danger:  { background: hov ? 'rgba(255,60,60,0.2)' : 'rgba(255,60,60,0.1)', border:'0.5px solid rgba(255,60,60,0.3)', color:'#FF6060' },
    green_outline: { background: hov ? 'rgba(0,200,83,0.1)' : 'transparent', border:'0.5px solid rgba(0,200,83,0.35)', color:'#00C853' },
  };
  return <button onClick={!disabled ? onClick : undefined} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{...base,...sz,...variants[variant],...style}}>{children}</button>;
}

function OcInput({ placeholder, value, onChange, type='text', style={}, icon }) {
  return (
    <div style={{ position:'relative', ...style }}>
      {icon && <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', fontSize:13, pointerEvents:'none' }}>{icon}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding: icon ? '9px 12px 9px 32px' : '9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
    </div>
  );
}

function OcSelect({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:'100%', background:'#0C1525', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color: value ? '#fff' : 'rgba(255,255,255,0.3)', fontSize:12, fontFamily:'inherit', outline:'none', cursor:'pointer', ...style }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function OcBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return <span style={{ display:'inline-block', background:s.bg, border:`0.5px solid ${s.border}`, color:s.color, fontSize:9, fontWeight:500, padding:'3px 10px', borderRadius:10, letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</span>;
}

function OcSectionTitle({ children }) {
  return <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>{children}</div>;
}

function OcDivider() {
  return <div style={{ height:'0.5px', background:'rgba(255,255,255,0.06)', margin:'16px 0' }} />;
}

function OcNavBar({ currentRoute, navigate, user, onAuthClick }) {
  const links = [
    { route: '/jugadores', label: 'Jugadores' },
    { route: '/tecnicos', label: 'Técnicos' },
    { route: '/clubes', label: 'Clubes' },
    { route: '/representantes', label: 'Representantes' },
  ];
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:56, borderBottom:'0.5px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', background:'rgba(5,10,20,0.85)' }}>
      {/* Logo */}
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'baseline', gap:2, cursor:'pointer' }}>
        <span style={{ color:'#fff', fontSize:16, fontWeight:500, letterSpacing:'-0.02em' }}>ONE</span>
        <div style={{ width:4, height:4, background:'#00C853', borderRadius:'50%', margin:'0 1px 1px', animation:'oc-blink 2s infinite' }} />
        <span style={{ color:'#00C853', fontSize:16, fontWeight:500, letterSpacing:'-0.02em' }}>CHANCE</span>
      </div>
      {/* Links */}
      <div style={{ display:'flex', gap:24 }}>
        {links.map(l => (
          <span key={l.route} onClick={() => navigate(l.route)} style={{ color: currentRoute.startsWith(l.route) ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:12, cursor:'pointer', transition:'color 0.2s', fontWeight: currentRoute.startsWith(l.route) ? 500 : 400 }}>{l.label}</span>
        ))}
      </div>
      {/* Auth */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        {user ? (
          <>
            {user.role === 'admin' && <OcButton variant="outline" size="sm" onClick={() => navigate('/admin')}>Admin</OcButton>}
            <OcButton variant="outline" size="sm" onClick={() => navigate('/dashboard')}>Mi perfil</OcButton>
            <OcButton variant="primary" size="sm" onClick={() => { onAuthClick('logout'); }}>Salir</OcButton>
          </>
        ) : (
          <>
            <OcButton variant="outline" size="sm" onClick={() => navigate('/auth?tab=login')}>Ingresar</OcButton>
            <OcButton variant="primary" size="sm" onClick={() => navigate('/auth?tab=register')}>Publicar perfil</OcButton>
          </>
        )}
      </div>
    </nav>
  );
}

function OcPageShell({ children, style={} }) {
  return (
    <div style={{ position:'relative', zIndex:2, paddingTop:56, minHeight:'100vh', ...style }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  MOCK_PLAYERS, MOCK_COACHES, MOCK_CLUBS, STATUS_COLORS, POSITIONS, COUNTRIES,
  OcBackground, OcButton, OcInput, OcSelect, OcBadge, OcSectionTitle, OcDivider, OcNavBar, OcPageShell
});
