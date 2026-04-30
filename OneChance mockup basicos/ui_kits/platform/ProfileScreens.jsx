// ProfileScreens.jsx — Coach, Club, Agent individual profiles + updated list screens

// ── EXPANDED MOCK DATA ────────────────────────────────────────
const MOCK_COACHES_FULL = [
  {
    id: 1, fullName: 'Martín Álvarez', nationality: 'Uruguay', age: 48,
    currentClub: 'Libre', years: 12,
    skills: ['Fútbol ofensivo','4-3-3','Desarrollo de jóvenes','Alta presión'],
    languages: ['Español','Portugués'],
    bio: 'Entrenador con más de 12 años de experiencia en el fútbol sudamericano. Especialista en formación de jóvenes talentos y sistemas ofensivos. Trabajó en clubes de Uruguay, Argentina y Paraguay.',
    career: [
      { club:'Nacional (Uruguay)', role:'Asistente técnico', years:'2022-2024' },
      { club:'Olimpia (Paraguay)', role:'DT principal', years:'2019-2022' },
      { club:'Defensor Sporting', role:'DT juveniles', years:'2016-2019' },
      { club:'Danubio FC', role:'Asistente', years:'2013-2016' },
    ],
    trophies: ['Campeón Apertura 2021 (Olimpia)','Sub-campeón Torneo Clausura 2023'],
    status: 'published'
  },
  {
    id: 2, fullName: 'Patricia Gómez', nationality: 'Argentina', age: 38,
    currentClub: 'UAI Urquiza (F)', years: 6,
    skills: ['Fútbol femenino','3-5-2','Alta presión','Trabajo físico'],
    languages: ['Español'],
    bio: 'Pionera del fútbol femenino en Argentina. Ex jugadora de la Selección Mayor. Reconvertida en DT, campeona de la Primera División Femenina en su primera temporada como técnica principal.',
    career: [
      { club:'UAI Urquiza (F)', role:'DT principal', years:'2022-act.' },
      { club:'River Plate (F)', role:'Asistente técnica', years:'2020-2022' },
      { club:'Boca Juniors (F)', role:'DT juveniles', years:'2018-2020' },
    ],
    trophies: ['Campeona Primera División Femenina 2023','Copa Federal Femenina 2022'],
    status: 'published'
  },
  {
    id: 3, fullName: 'Ricardo Souza', nationality: 'Brasil', age: 55,
    currentClub: 'Libre',  years: 22,
    skills: ['Fútbol defensivo','5-3-2','Experiencia internacional','Gestión de plantel'],
    languages: ['Portugués','Español','Inglés'],
    bio: 'Técnico experimentado con pasaje por ligas de Brasil, Argentina, México y Europa. Especialista en organización defensiva y gestión de equipos de alto rendimiento.',
    career: [
      { club:'Vasco da Gama', role:'DT principal', years:'2018-2022' },
      { club:'Estudiantes LP', role:'DT principal', years:'2015-2018' },
      { club:'Cruz Azul', role:'Asistente', years:'2012-2015' },
    ],
    trophies: ['Copa Argentina 2017','Campeón Serie B Brasil 2020'],
    status: 'published'
  },
];

const MOCK_CLUBS_FULL = [
  {
    id: 1, name: 'Unión Deportiva Norte', country: 'Argentina', city: 'Rosario', province: 'Santa Fe',
    division: 'Primera C', president: 'Eduardo Blanco', currentDirector: 'Sergio Paz',
    currentCoach: 'Jorge Reyes', founded: 1948,
    seeking: ['Delantero','Lateral D','Arquero'],
    bio: 'Club histórico del interior de Argentina con más de 75 años de trayectoria. Formador de jugadores que llegaron a Primera División. Actualmente compitiendo en Primera C con proyección de ascenso.',
    achievements: ['Campeón Regional 2018','Subcampeón Primera C 2022','3 jugadores transferidos a Primera División en los últimos 5 años'],
    status: 'published'
  },
  {
    id: 2, name: 'Deportivo Las Palmas', country: 'Chile', city: 'Valparaíso', province: 'Valparaíso',
    division: 'Segunda División', president: 'Ana Fuentes', currentDirector: 'Marcos León',
    currentCoach: 'Diego Herrera', founded: 1972,
    seeking: ['Volante','Mediocampista central','Defensa'],
    bio: 'Club porteño con fuerte identidad de barrio. Apuesta por jugadores jóvenes y un fútbol de ataque. Infraestructura propia con cancha de césped sintético y vestuarios modernos.',
    achievements: ['Campeón Regional 2020','Ascenso a Segunda División 2021'],
    status: 'published'
  },
  {
    id: 3, name: 'Atlético Guaraní FC', country: 'Paraguay', city: 'Asunción', province: 'Central',
    division: 'División Intermedia', president: 'Roberto Insaurralde', currentDirector: 'Luis Bogado',
    currentCoach: 'Carlos Ferreira', founded: 1935,
    seeking: ['Enganche','Extremo','Arquero'],
    bio: 'Institución fundada en 1935 con gran tradición paraguaya. Cuenta con divisiones juveniles desde los 8 años y un programa activo de scouting regional.',
    achievements: ['Campeón División Intermedia 2019','Formador de 8 internacionales paraguayos'],
    status: 'published'
  },
];

const MOCK_AGENTS_FULL = [
  {
    id: 1, fullName: 'Carlos Vega', nationality: 'Argentina', agencyName: 'CV Sport Management',
    players: 18, countries: 5, markets: ['Argentina','Uruguay','Brasil','Paraguay','Chile'],
    bio: 'Agente FIFA con más de 10 años de experiencia en el mercado sudamericano. Especializado en transferencias internacionales y representación de jugadores jóvenes con proyección al exterior.',
    career: 'Fundó CV Sport Management en 2014 tras trabajar 5 años como scout para clubes argentinos. Ha concretado más de 40 transferencias internacionales.',
    notableTransfers: ['Transferencia a liga portuguesa (2023)','Pase a México – Liga MX (2022)','Venta a fútbol chileno (2021)'],
    status: 'published'
  },
  {
    id: 2, fullName: 'Laura Méndez', nationality: 'Chile', agencyName: 'Global Talent SA',
    players: 9, countries: 3, markets: ['Chile','Colombia','México'],
    bio: 'Representante especializada en fútbol femenino. Pionera en el mercado de fichajes de jugadoras latinoamericanas hacia ligas europeas.',
    career: 'Ex jugadora profesional reconvertida en representante. Fundó Global Talent SA en 2019 con foco en el fútbol femenino de alto rendimiento.',
    notableTransfers: ['Jugadora a liga española – Primera Iberdrola (2024)','Transferencia a liga francesa (2023)'],
    status: 'published'
  },
  {
    id: 3, fullName: 'Diego Castellanos', nationality: 'Colombia', agencyName: 'Sudamérica Sports Group',
    players: 31, countries: 8, markets: ['Colombia','Venezuela','Ecuador','Perú','Bolivia','Argentina','Uruguay','Brasil'],
    bio: 'Uno de los representantes más activos de la región. Maneja un roster diverso de jugadores en todas las categorías y posiciones.',
    career: 'Más de 15 años en el negocio del fútbol. Fundó Sudamérica Sports Group en 2010.',
    notableTransfers: ['Múltiples pases a ligas de Europa del Este','Transferencias a MLS (2022-2024)'],
    status: 'published'
  },
];

// ── COACH PROFILE ─────────────────────────────────────────────
function CoachProfileScreen({ coachId, navigate }) {
  const coach = MOCK_COACHES_FULL.find(c => c.id === parseInt(coachId));
  if (!coach) return <OcPageShell><div style={{ padding:60, textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Técnico no encontrado.</div></OcPageShell>;

  return (
    <OcPageShell>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 24px' }}>
        <OcButton variant="ghost" onClick={() => navigate('/tecnicos')} style={{ marginBottom:20, fontSize:11 }}>← Volver a técnicos</OcButton>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#080F1C,#050A18)', border:'0.5px solid rgba(80,140,255,0.25)', borderRadius:'20px 4px 20px 20px', marginBottom:16, overflow:'hidden', clipPath:'polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%)' }}>
          <div style={{ height:2, background:'linear-gradient(90deg,#5A8FFF,rgba(0,0,0,0))' }} />
          <div style={{ display:'flex', alignItems:'stretch' }}>
            {/* Left panel */}
            <div style={{ width:220, flexShrink:0, background:'rgba(80,140,255,0.06)', borderRight:'0.5px solid rgba(80,140,255,0.12)', padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0, position:'relative' }}>
              {/* Shield */}
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)', width:130, height:130, opacity:0.06 }}>
                <svg viewBox="0 0 100 110" fill="#5A8FFF" xmlns="http://www.w3.org/2000/svg"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
              </div>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)', width:118, height:118, opacity:0.15 }}>
                <svg viewBox="0 0 100 110" fill="none" stroke="#5A8FFF" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
              </div>
              {/* Avatar */}
              <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#5A8FFF,#0B1A3A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, border:'2px solid rgba(90,143,255,0.4)', boxShadow:'0 0 28px rgba(90,143,255,0.2)', zIndex:1, marginBottom:12, animation:'oc-float 6s ease-in-out infinite' }}>📋</div>
              <div style={{ color:'#fff', fontSize:14, fontWeight:500, textAlign:'center', zIndex:1 }}>{coach.fullName}</div>
              <div style={{ color:'rgba(90,143,255,0.8)', fontSize:11, marginTop:4, textAlign:'center', zIndex:1 }}>Técnico</div>
              <div style={{ marginTop:14, zIndex:1, background:'rgba(90,143,255,0.12)', border:'0.5px solid rgba(90,143,255,0.25)', borderRadius:10, padding:'8px 18px', textAlign:'center' }}>
                <div style={{ color:'#5A8FFF', fontSize:24, fontWeight:500, lineHeight:1 }}>{coach.years}</div>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>Años exp.</div>
              </div>
            </div>
            {/* Right panel */}
            <div style={{ flex:1, padding:'24px 28px' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
                <OcBadge status={coach.status} />
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{coach.nationality}</span>
                <span style={{ color:'rgba(255,255,255,0.1)' }}>·</span>
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{coach.age} años</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:18 }}>
                {[['Club actual', coach.currentClub],['Experiencia', `${coach.years} años`],['Idiomas', coach.languages.join(', ')]].map(([l,v]) => (
                  <div key={l} style={{ background:'rgba(90,143,255,0.06)', border:'0.5px solid rgba(90,143,255,0.15)', borderRadius:9, padding:'10px 12px' }}>
                    <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</div>
                    <div style={{ color:'#fff', fontSize:12, fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:8 }}>Habilidades</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {coach.skills.map(s => <span key={s} style={{ background:'rgba(90,143,255,0.08)', border:'0.5px solid rgba(90,143,255,0.22)', color:'#5A8FFF', fontSize:10, padding:'4px 11px', borderRadius:20 }}>{s}</span>)}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background: coach.currentClub === 'Libre' ? '#00C853' : '#5A8FFF', boxShadow: coach.currentClub === 'Libre' ? '0 0 6px #00C853' : 'none' }} />
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{coach.currentClub === 'Libre' ? 'Disponible para propuestas' : coach.currentClub}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Sobre el técnico</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:1.8 }}>{coach.bio}</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Trayectoria</OcSectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {coach.career.map((c,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background: i===0 ? '#5A8FFF' : 'rgba(255,255,255,0.15)', flexShrink:0, marginTop:4 }} />
                    <div style={{ flex:1 }}>
                      <span style={{ color: i===0 ? '#fff' : 'rgba(255,255,255,0.5)', fontSize:12, fontWeight: i===0 ? 500 : 400 }}>{c.club}</span>
                      <span style={{ color:'rgba(255,255,255,0.25)', fontSize:10, marginLeft:8 }}>{c.role}</span>
                    </div>
                    <span style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>{c.years}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Logros</OcSectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {coach.trophies.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span style={{ color:'#FFB400', fontSize:11 }}>★</span>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11, lineHeight:1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'rgba(90,143,255,0.06)', border:'0.5px solid rgba(90,143,255,0.2)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Contacto</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, lineHeight:1.6, marginBottom:12 }}>Para contactar a este técnico, registrá tu institución o iniciá sesión.</p>
              <OcButton variant="primary" size="sm" style={{ width:'100%', justifyContent:'center' }}>Contactar</OcButton>
            </div>
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

// ── CLUB PROFILE ─────────────────────────────────────────────
function ClubProfileScreen({ clubId, navigate }) {
  const club = MOCK_CLUBS_FULL.find(c => c.id === parseInt(clubId));
  if (!club) return <OcPageShell><div style={{ padding:60, textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Club no encontrado.</div></OcPageShell>;

  return (
    <OcPageShell>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 24px' }}>
        <OcButton variant="ghost" onClick={() => navigate('/clubes')} style={{ marginBottom:20, fontSize:11 }}>← Volver a clubes</OcButton>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#0D1829,#080F18)', border:'0.5px solid rgba(255,180,0,0.25)', borderRadius:'20px 4px 20px 20px', marginBottom:16, overflow:'hidden', clipPath:'polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%)' }}>
          <div style={{ height:2, background:'linear-gradient(90deg,#FFB400,rgba(0,0,0,0))' }} />
          <div style={{ display:'flex', alignItems:'stretch' }}>
            <div style={{ width:220, flexShrink:0, background:'rgba(255,180,0,0.05)', borderRight:'0.5px solid rgba(255,180,0,0.1)', padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)', width:130, height:130, opacity:0.05 }}>
                <svg viewBox="0 0 100 110" fill="#FFB400" xmlns="http://www.w3.org/2000/svg"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
              </div>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)', width:118, height:118, opacity:0.18 }}>
                <svg viewBox="0 0 100 110" fill="none" stroke="#FFB400" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
              </div>
              <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#FFB400,#3A2800)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, border:'2px solid rgba(255,180,0,0.4)', boxShadow:'0 0 28px rgba(255,180,0,0.15)', zIndex:1, marginBottom:12, animation:'oc-float 6s ease-in-out infinite' }}>🏟️</div>
              <div style={{ color:'#fff', fontSize:13, fontWeight:500, textAlign:'center', zIndex:1 }}>{club.name}</div>
              <div style={{ color:'rgba(255,180,0,0.8)', fontSize:11, marginTop:4, textAlign:'center', zIndex:1 }}>{club.division}</div>
              <div style={{ marginTop:14, zIndex:1, background:'rgba(255,180,0,0.1)', border:'0.5px solid rgba(255,180,0,0.25)', borderRadius:10, padding:'8px 18px', textAlign:'center' }}>
                <div style={{ color:'#FFB400', fontSize:22, fontWeight:500, lineHeight:1 }}>{club.founded}</div>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>Fundación</div>
              </div>
            </div>
            <div style={{ flex:1, padding:'24px 28px' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16 }}>
                <OcBadge status={club.status} />
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{club.city}, {club.province}</span>
                <span style={{ color:'rgba(255,255,255,0.1)' }}>·</span>
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{club.country}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:18 }}>
                {[['Presidente',club.president],['Director',club.currentDirector],['DT actual',club.currentCoach],['División',club.division]].map(([l,v]) => (
                  <div key={l} style={{ background:'rgba(255,180,0,0.05)', border:'0.5px solid rgba(255,180,0,0.12)', borderRadius:9, padding:'10px 12px' }}>
                    <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</div>
                    <div style={{ color:'#fff', fontSize:12, fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
              {club.seeking.length > 0 && (
                <div>
                  <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:8 }}>Buscando</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {club.seeking.map(s => <span key={s} style={{ background:'rgba(255,180,0,0.1)', border:'0.5px solid rgba(255,180,0,0.3)', color:'#FFB400', fontSize:10, padding:'4px 11px', borderRadius:20 }}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Sobre el club</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:1.8 }}>{club.bio}</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Logros y reconocimientos</OcSectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {club.achievements.map((a,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span style={{ color:'#FFB400', fontSize:11, flexShrink:0 }}>★</span>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Ubicación</OcSectionTitle>
              <div style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{club.city}</div>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:3 }}>{club.province} · {club.country}</div>
            </div>
            <div style={{ background:'rgba(255,180,0,0.05)', border:'0.5px solid rgba(255,180,0,0.2)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Contacto institucional</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, lineHeight:1.6, marginBottom:12 }}>Para conectar con este club, registrá tu perfil o iniciá sesión.</p>
              <OcButton variant="primary" size="sm" style={{ width:'100%', justifyContent:'center' }}>Contactar</OcButton>
            </div>
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

// ── AGENT PROFILE ─────────────────────────────────────────────
function AgentProfileScreen({ agentId, navigate }) {
  const agent = MOCK_AGENTS_FULL.find(a => a.id === parseInt(agentId));
  if (!agent) return <OcPageShell><div style={{ padding:60, textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Representante no encontrado.</div></OcPageShell>;

  return (
    <OcPageShell>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 24px' }}>
        <OcButton variant="ghost" onClick={() => navigate('/representantes')} style={{ marginBottom:20, fontSize:11 }}>← Volver a representantes</OcButton>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#120A1E,#0B0518)', border:'0.5px solid rgba(180,100,255,0.25)', borderRadius:'20px 4px 20px 20px', marginBottom:16, overflow:'hidden', clipPath:'polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%)' }}>
          <div style={{ height:2, background:'linear-gradient(90deg,#B464FF,rgba(0,0,0,0))' }} />
          <div style={{ display:'flex', alignItems:'stretch' }}>
            <div style={{ width:220, flexShrink:0, background:'rgba(180,100,255,0.06)', borderRight:'0.5px solid rgba(180,100,255,0.12)', padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)', width:130, height:130, opacity:0.06 }}>
                <svg viewBox="0 0 100 110" fill="#B464FF" xmlns="http://www.w3.org/2000/svg"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
              </div>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)', width:118, height:118, opacity:0.18 }}>
                <svg viewBox="0 0 100 110" fill="none" stroke="#B464FF" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
              </div>
              <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#B464FF,#2A0A3A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, border:'2px solid rgba(180,100,255,0.4)', boxShadow:'0 0 28px rgba(180,100,255,0.18)', zIndex:1, marginBottom:12, animation:'oc-float 6s ease-in-out infinite' }}>🤝</div>
              <div style={{ color:'#fff', fontSize:13, fontWeight:500, textAlign:'center', zIndex:1 }}>{agent.fullName}</div>
              <div style={{ color:'rgba(180,100,255,0.8)', fontSize:10, marginTop:4, textAlign:'center', zIndex:1 }}>{agent.agencyName}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:14, zIndex:1, width:'100%' }}>
                {[['Jugadores',agent.players],['Países',agent.countries]].map(([l,v]) => (
                  <div key={l} style={{ background:'rgba(180,100,255,0.1)', border:'0.5px solid rgba(180,100,255,0.2)', borderRadius:8, padding:'7px 10px', textAlign:'center' }}>
                    <div style={{ color:'#B464FF', fontSize:18, fontWeight:500 }}>{v}</div>
                    <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', marginTop:1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1, padding:'24px 28px' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16 }}>
                <OcBadge status={agent.status} />
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{agent.nationality}</span>
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:8 }}>Mercados</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {agent.markets.map(m => <span key={m} style={{ background:'rgba(180,100,255,0.08)', border:'0.5px solid rgba(180,100,255,0.2)', color:'#B464FF', fontSize:10, padding:'4px 11px', borderRadius:20 }}>{m}</span>)}
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:9, padding:'12px 14px' }}>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Agencia</div>
                <div style={{ color:'#fff', fontSize:14, fontWeight:500 }}>{agent.agencyName}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Sobre el representante</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:1.8, marginBottom:10 }}>{agent.bio}</p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, lineHeight:1.8 }}>{agent.career}</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Transferencias destacadas</OcSectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {agent.notableTransfers.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span style={{ color:'#B464FF', fontSize:11, flexShrink:0 }}>→</span>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'rgba(180,100,255,0.05)', border:'0.5px solid rgba(180,100,255,0.2)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Contacto</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, lineHeight:1.6, marginBottom:12 }}>Para contactar a este representante, iniciá sesión o registrá tu perfil.</p>
              <OcButton variant="primary" size="sm" style={{ width:'100%', justifyContent:'center' }}>Contactar</OcButton>
            </div>
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

// ── UPDATED LIST SCREENS ──────────────────────────────────────
function TecsScreen({ navigate }) {
  return (
    <OcPageShell>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(80,140,255,0.08)', border:'0.5px solid rgba(80,140,255,0.2)', borderRadius:20, padding:'4px 12px', marginBottom:14 }}>
            <div style={{ width:5, height:5, background:'#5A8FFF', borderRadius:'50%' }} />
            <span style={{ color:'#5A8FFF', fontSize:9, letterSpacing:'0.07em' }}>{MOCK_COACHES_FULL.length} TÉCNICOS DISPONIBLES</span>
          </div>
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:500, letterSpacing:'-0.03em', marginBottom:6 }}>Técnicos</h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>Entrenadores y cuerpos técnicos · Todas las categorías</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
          {MOCK_COACHES_FULL.map(c => {
            const [hov, setHov] = React.useState(false);
            return (
              <div key={c.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => navigate(`/tecnicos/${c.id}`)}
                style={{ background: hov ? 'rgba(8,15,28,0.95)' : 'rgba(8,15,28,0.8)', border:`0.5px solid ${hov ? 'rgba(80,140,255,0.35)' : 'rgba(80,140,255,0.18)'}`, borderRadius:12, padding:'18px', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height: hov ? 2 : 0, background:'linear-gradient(90deg,#5A8FFF,rgba(0,0,0,0))', transition:'height 0.2s' }} />
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#5A8FFF,#0B1A3A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'1.5px solid rgba(90,143,255,0.35)', flexShrink:0 }}>📋</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{c.fullName}</div>
                    <div style={{ color:'rgba(90,143,255,0.75)', fontSize:10, marginTop:2 }}>Técnico · {c.nationality}</div>
                  </div>
                  <div style={{ background:'rgba(90,143,255,0.1)', borderRadius:7, padding:'5px 8px', textAlign:'center', flexShrink:0 }}>
                    <div style={{ color:'#5A8FFF', fontSize:14, fontWeight:500, lineHeight:1 }}>{c.years}</div>
                    <div style={{ color:'rgba(255,255,255,0.2)', fontSize:7, marginTop:1, textTransform:'uppercase' }}>Años</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                  {c.skills.slice(0,3).map(s => <span key={s} style={{ background:'rgba(90,143,255,0.07)', border:'0.5px solid rgba(90,143,255,0.18)', color:'#5A8FFF', fontSize:9, padding:'3px 9px', borderRadius:8 }}>{s}</span>)}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background: c.currentClub === 'Libre' ? '#00C853' : '#5A8FFF' }} />
                    <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10 }}>{c.currentClub === 'Libre' ? 'Disponible' : c.currentClub}</span>
                  </div>
                  <span style={{ color: hov ? '#5A8FFF' : 'rgba(255,255,255,0.2)', fontSize:11, transition:'color 0.2s' }}>Ver perfil →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OcPageShell>
  );
}

function ClubsScreen({ navigate }) {
  return (
    <OcPageShell>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,180,0,0.08)', border:'0.5px solid rgba(255,180,0,0.2)', borderRadius:20, padding:'4px 12px', marginBottom:14 }}>
            <div style={{ width:5, height:5, background:'#FFB400', borderRadius:'50%' }} />
            <span style={{ color:'#FFB400', fontSize:9, letterSpacing:'0.07em' }}>{MOCK_CLUBS_FULL.length} CLUBES REGISTRADOS</span>
          </div>
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:500, letterSpacing:'-0.03em', marginBottom:6 }}>Clubes</h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>Instituciones registradas en la plataforma · Todas las divisiones</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
          {MOCK_CLUBS_FULL.map(c => {
            const [hov, setHov] = React.useState(false);
            return (
              <div key={c.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => navigate(`/clubes/${c.id}`)}
                style={{ background: hov ? 'rgba(13,24,41,0.95)' : 'rgba(13,24,41,0.8)', border:`0.5px solid ${hov ? 'rgba(255,180,0,0.35)' : 'rgba(255,180,0,0.18)'}`, borderRadius:12, padding:'18px', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height: hov ? 2 : 0, background:'linear-gradient(90deg,#FFB400,rgba(0,0,0,0))', transition:'height 0.2s' }} />
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#FFB400,#3A2800)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'1.5px solid rgba(255,180,0,0.35)', flexShrink:0 }}>🏟️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{c.name}</div>
                    <div style={{ color:'rgba(255,180,0,0.75)', fontSize:10, marginTop:2 }}>{c.division} · {c.country}</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                  {[['Presidente',c.president],['DT',c.currentCoach]].map(([l,v]) => (
                    <div key={l} style={{ background:'rgba(255,180,0,0.05)', borderRadius:7, padding:'6px 9px' }}>
                      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{l}</div>
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {c.seeking.length > 0 && (
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                    {c.seeking.slice(0,3).map(s => <span key={s} style={{ background:'rgba(255,180,0,0.08)', border:'0.5px solid rgba(255,180,0,0.2)', color:'#FFB400', fontSize:9, padding:'2px 8px', borderRadius:8 }}>{s}</span>)}
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <span style={{ color: hov ? '#FFB400' : 'rgba(255,255,255,0.2)', fontSize:11, transition:'color 0.2s' }}>Ver perfil →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OcPageShell>
  );
}

function AgentsScreen({ navigate }) {
  return (
    <OcPageShell>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(180,100,255,0.08)', border:'0.5px solid rgba(180,100,255,0.2)', borderRadius:20, padding:'4px 12px', marginBottom:14 }}>
            <div style={{ width:5, height:5, background:'#B464FF', borderRadius:'50%' }} />
            <span style={{ color:'#B464FF', fontSize:9, letterSpacing:'0.07em' }}>{MOCK_AGENTS_FULL.length} REPRESENTANTES REGISTRADOS</span>
          </div>
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:500, letterSpacing:'-0.03em', marginBottom:6 }}>Representantes</h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>Agentes y agencias · Mercado sudamericano e internacional</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
          {MOCK_AGENTS_FULL.map(a => {
            const [hov, setHov] = React.useState(false);
            return (
              <div key={a.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => navigate(`/representantes/${a.id}`)}
                style={{ background: hov ? 'rgba(18,10,30,0.95)' : 'rgba(18,10,30,0.8)', border:`0.5px solid ${hov ? 'rgba(180,100,255,0.35)' : 'rgba(180,100,255,0.2)'}`, borderRadius:12, padding:'18px', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height: hov ? 2 : 0, background:'linear-gradient(90deg,#B464FF,rgba(0,0,0,0))', transition:'height 0.2s' }} />
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#B464FF,#2A0A3A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'1.5px solid rgba(180,100,255,0.35)', flexShrink:0 }}>🤝</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{a.fullName}</div>
                    <div style={{ color:'rgba(180,100,255,0.75)', fontSize:10, marginTop:2 }}>{a.agencyName}</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                  {[['Jugadores',a.players],['Países',a.countries]].map(([l,v]) => (
                    <div key={l} style={{ background:'rgba(180,100,255,0.07)', border:'0.5px solid rgba(180,100,255,0.15)', borderRadius:7, padding:'7px', textAlign:'center' }}>
                      <div style={{ color:'#B464FF', fontSize:16, fontWeight:500 }}>{v}</div>
                      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', marginTop:1 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, marginBottom:8 }}>Mercados: {a.markets.slice(0,3).join(', ')}{a.markets.length > 3 ? ` +${a.markets.length-3}` : ''}</div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <span style={{ color: hov ? '#B464FF' : 'rgba(255,255,255,0.2)', fontSize:11, transition:'color 0.2s' }}>Ver perfil →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OcPageShell>
  );
}

Object.assign(window, {
  MOCK_COACHES_FULL, MOCK_CLUBS_FULL, MOCK_AGENTS_FULL,
  CoachProfileScreen, ClubProfileScreen, AgentProfileScreen,
  TecsScreen, ClubsScreen, AgentsScreen
});
