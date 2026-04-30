// PlayersScreen.jsx — Public players listing + individual profile

function PlayerCard({ player, onClick }) {
  const [hov, setHov] = React.useState(false);
  const isFemale = player.gender === 'F';
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: hov ? 'rgba(12,31,18,0.9)' : 'rgba(8,15,20,0.8)', border:`0.5px solid ${hov ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'16px', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
      {player.isFeatured && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#00C853,rgba(0,200,83,0.2))' }} />}
      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:`linear-gradient(135deg,${isFemale ? '#B464FF,#3A1A5A' : '#00C853,#003A18'})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:`1.5px solid ${isFemale ? 'rgba(180,100,255,0.4)' : 'rgba(0,200,83,0.35)'}`, flexShrink:0 }}>
          {isFemale ? '👩' : '👤'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{player.fullName}</span>
            {player.isFeatured && <span style={{ background:'#00C853', color:'#002A12', fontSize:7, fontWeight:500, padding:'2px 7px', borderRadius:8, letterSpacing:'0.06em' }}>★ DEST.</span>}
          </div>
          <div style={{ color:'rgba(0,200,83,0.75)', fontSize:10, marginTop:2 }}>{player.position}</div>
        </div>
        <div style={{ background:`${isFemale ? 'rgba(180,100,255,0.1)' : 'rgba(0,200,83,0.1)'}`, borderRadius:7, padding:'5px 8px', textAlign:'center', flexShrink:0 }}>
          <div style={{ color: isFemale ? '#B464FF' : '#00C853', fontSize:15, fontWeight:500, lineHeight:1 }}>{player.overall}</div>
          <div style={{ color:'rgba(255,255,255,0.2)', fontSize:7, marginTop:1, textTransform:'uppercase', letterSpacing:'0.04em' }}>OVR</div>
        </div>
      </div>
      {/* Info chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        {[player.nationality, `${player.age} años`, player.strongFoot === 'Der' ? '🦶Der' : '🦶Izq'].map(t => (
          <span key={t} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'3px 8px', color:'rgba(255,255,255,0.4)', fontSize:9 }}>{t}</span>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'rgba(255,255,255,0.25)', fontSize:10 }}>{player.currentClub || 'Libre'}</span>
        <span style={{ color: hov ? '#00C853' : 'rgba(255,255,255,0.2)', fontSize:11, transition:'color 0.2s' }}>Ver perfil →</span>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, setFilters }) {
  const genders = [{value:'',label:'Todos'},{value:'M',label:'Masculino'},{value:'F',label:'Femenino'}];
  const ageRanges = [{value:'',label:'Todos'},{value:'13-17',label:'13–17 años'},{value:'18-22',label:'18–22 años'},{value:'23-30',label:'23–30 años'}];
  const feet = [{value:'',label:'Todos'},{value:'Der',label:'Derecho'},{value:'Izq',label:'Izquierdo'}];
  const posOpts = [{value:'',label:'Todos'},...POSITIONS.map(p => ({value:p,label:p}))];
  const natOpts = [{value:'',label:'Todos'},...COUNTRIES.map(c => ({value:c,label:c}))];

  const F = ({ label, children }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
      {children}
    </div>
  );
  const Pills = ({ opts, key_, val }) => (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
      {opts.map(o => (
        <div key={o.value} onClick={() => setFilters(f => ({...f,[key_]:o.value}))}
          style={{ padding:'4px 10px', borderRadius:20, fontSize:9, cursor:'pointer', transition:'all 0.15s',
            background: val === o.value ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.03)',
            border:`0.5px solid ${val === o.value ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: val === o.value ? '#00C853' : 'rgba(255,255,255,0.35)' }}>
          {o.label}
        </div>
      ))}
    </div>
  );
  return (
    <aside style={{ width:200, flexShrink:0, background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, padding:16, position:'sticky', top:72, alignSelf:'flex-start' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <span style={{ color:'#fff', fontSize:12, fontWeight:500 }}>Filtros</span>
        <span onClick={() => setFilters({gender:'',ageRange:'',position:'',nationality:'',strongFoot:''})} style={{ color:'rgba(0,200,83,0.6)', fontSize:10, cursor:'pointer' }}>Limpiar</span>
      </div>
      <F label="Sexo"><Pills opts={genders} key_="gender" val={filters.gender} /></F>
      <F label="Categoría"><Pills opts={ageRanges} key_="ageRange" val={filters.ageRange} /></F>
      <F label="Puesto"><OcSelect value={filters.position} onChange={v => setFilters(f=>({...f,position:v}))} options={posOpts} /></F>
      <F label="Nacionalidad"><OcSelect value={filters.nationality} onChange={v => setFilters(f=>({...f,nationality:v}))} options={natOpts} /></F>
      <F label="Pierna"><Pills opts={feet} key_="strongFoot" val={filters.strongFoot} /></F>
    </aside>
  );
}

function PlayersListScreen({ navigate }) {
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState({ gender:'', ageRange:'', position:'', nationality:'', strongFoot:'' });

  const visible = MOCK_PLAYERS.filter(p => {
    if (p.status !== 'published') return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.ageRange && p.ageRange !== filters.ageRange) return false;
    if (filters.position && p.position !== filters.position) return false;
    if (filters.nationality && p.nationality !== filters.nationality) return false;
    if (filters.strongFoot && p.strongFoot !== filters.strongFoot) return false;
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase()) && !p.position.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <OcPageShell>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(0,200,83,0.08)', border:'0.5px solid rgba(0,200,83,0.2)', borderRadius:20, padding:'4px 12px', marginBottom:14 }}>
            <div style={{ width:5, height:5, background:'#00C853', borderRadius:'50%', animation:'oc-blink 2s infinite' }} />
            <span style={{ color:'#00C853', fontSize:9, letterSpacing:'0.07em' }}>{visible.length} JUGADORES DISPONIBLES</span>
          </div>
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:500, letterSpacing:'-0.03em', marginBottom:6 }}>Jugadores</h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>Masculino y femenino · Todas las categorías · 14 países</p>
        </div>
        {/* Search */}
        <OcInput placeholder="Buscar por nombre o puesto..." value={search} onChange={setSearch} icon="⚽" style={{ marginBottom:24, maxWidth:400 }} />
        {/* Layout */}
        <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <FilterSidebar filters={filters} setFilters={setFilters} />
          <div style={{ flex:1 }}>
            {visible.length === 0
              ? <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No se encontraron jugadores con esos filtros.</div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
                  {visible.map(p => <PlayerCard key={p.id} player={p} onClick={() => navigate(`/jugadores/${p.id}`)} />)}
                </div>
            }
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

function StatChip({ label, value }) {
  return (
    <div style={{ background:'rgba(0,200,83,0.07)', border:'0.5px solid rgba(0,200,83,0.15)', borderRadius:9, padding:'10px 14px', textAlign:'center' }}>
      <div style={{ color:'#00C853', fontSize:18, fontWeight:500, letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, marginTop:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
    </div>
  );
}

function PlayerProfileScreen({ playerId, navigate }) {
  const player = MOCK_PLAYERS.find(p => p.id === parseInt(playerId));
  if (!player) return <OcPageShell><div style={{ padding:60, textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Jugador no encontrado.</div></OcPageShell>;
  const isFemale = player.gender === 'F';
  const accent = isFemale ? '#B464FF' : '#00C853';

  return (
    <OcPageShell>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 24px' }}>
        <OcButton variant="ghost" onClick={() => navigate('/jugadores')} style={{ marginBottom:20, fontSize:11 }}>← Volver al listado</OcButton>

        {/* Hero — Shield card style */}
        <div style={{ background:`linear-gradient(135deg,${isFemale ? '#1A0A2E,#0B0518' : '#0C1F12,#060F09'})`, border:`0.5px solid ${isFemale ? 'rgba(180,100,255,0.25)' : 'rgba(0,200,83,0.25)'}`, borderRadius:'20px 4px 20px 20px', marginBottom:16, position:'relative', overflow:'hidden', clipPath:'polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%)' }}>
          {/* Top accent bar */}
          <div style={{ height:2, background:`linear-gradient(90deg,${accent},rgba(0,0,0,0))` }} />

          <div style={{ display:'flex', alignItems:'stretch', gap:0 }}>

            {/* LEFT — Shield / avatar panel */}
            <div style={{ width:220, flexShrink:0, background:`linear-gradient(160deg,${isFemale ? 'rgba(180,100,255,0.12)' : 'rgba(0,200,83,0.1)'},rgba(0,0,0,0))`, borderRight:`0.5px solid ${accent}22`, padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0, position:'relative' }}>
              {/* Shield shape behind avatar */}
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:140, height:140, opacity:0.07 }}>
                <svg viewBox="0 0 100 110" fill={accent} xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" />
                </svg>
              </div>
              {/* Shield outline */}
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:130, height:130, opacity:0.18 }}>
                <svg viewBox="0 0 100 110" fill="none" stroke={accent} strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" />
                </svg>
              </div>

              {/* Badge label */}
              {player.isFeatured && (
                <div style={{ background:accent, color: isFemale ? '#fff' : '#002A12', fontSize:8, fontWeight:500, padding:'3px 10px', borderRadius:10, letterSpacing:'0.07em', marginBottom:14, zIndex:1 }}>★ DESTACADO</div>
              )}

              {/* Avatar — floating in front of shield */}
              <div style={{ width:96, height:96, borderRadius:'50%', background:`linear-gradient(135deg,${accent},${isFemale ? '#1A0A2E' : '#003A18'})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, border:`2.5px solid ${accent}66`, boxShadow:`0 0 32px ${accent}30`, zIndex:1, marginBottom:14, animation:'oc-float 6s ease-in-out infinite' }}>
                {isFemale ? '👩' : '👤'}
              </div>

              {/* Name under avatar */}
              <div style={{ color:'#fff', fontSize:15, fontWeight:500, textAlign:'center', zIndex:1, lineHeight:1.2 }}>{player.fullName}</div>
              <div style={{ color:`${accent}BB`, fontSize:11, marginTop:4, textAlign:'center', zIndex:1 }}>{player.position}</div>

              {/* Overall score */}
              <div style={{ marginTop:16, zIndex:1, background:`${accent}15`, border:`0.5px solid ${accent}30`, borderRadius:10, padding:'8px 20px', textAlign:'center' }}>
                <div style={{ color:accent, fontSize:28, fontWeight:500, lineHeight:1, letterSpacing:'-0.02em' }}>{player.overall}</div>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>Overall</div>
              </div>
            </div>

            {/* RIGHT — Info panel */}
            <div style={{ flex:1, padding:'24px 28px' }}>
              {/* Status + country */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <OcBadge status={player.status} />
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{player.nationality}</span>
                <span style={{ color:'rgba(255,255,255,0.1)', fontSize:11 }}>·</span>
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{player.ageRange} años</span>
              </div>

              {/* Stats grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20 }}>
                {[['Edad',`${player.age}`],['Altura',`${player.height}m`],['Peso',`${player.weight}kg`],['Pierna',player.strongFoot]].map(([l,v]) => (
                  <div key={l} style={{ background:`${accent}08`, border:`0.5px solid ${accent}20`, borderRadius:9, padding:'10px 12px', textAlign:'center' }}>
                    <div style={{ color:accent, fontSize:16, fontWeight:500, lineHeight:1 }}>{v}</div>
                    <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, marginTop:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Characteristics preview */}
              <div style={{ marginBottom:16 }}>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:8 }}>Características</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {player.characteristics.map(c => (
                    <span key={c} style={{ background:`${accent}10`, border:`0.5px solid ${accent}30`, color:accent, fontSize:10, padding:'4px 11px', borderRadius:20 }}>{c}</span>
                  ))}
                </div>
              </div>

              {/* Club */}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:accent, boxShadow:`0 0 6px ${accent}` }} />
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{player.currentClub || 'Libre'}</span>
                <span style={{ color:'rgba(255,255,255,0.15)', fontSize:11 }}>·</span>
                <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{player.career[0]?.years}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-col layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Bio */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Sobre el jugador</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:1.8 }}>{player.bio}</p>
            </div>

            {/* Characteristics */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Características</OcSectionTitle>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                {player.characteristics.map(c => (
                  <span key={c} style={{ background:`${accent}10`, border:`0.5px solid ${accent}30`, color:accent, fontSize:10, padding:'5px 12px', borderRadius:20 }}>{c}</span>
                ))}
              </div>
            </div>

            {/* Career */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Trayectoria</OcSectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {player.career.map((c,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background: i === 0 ? accent : 'rgba(255,255,255,0.15)', flexShrink:0 }} />
                    <span style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)', fontSize:12, flex:1 }}>{c.club}</span>
                    <span style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>{c.years}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
              <OcSectionTitle>Videos ({player.videos})</OcSectionTitle>
              {player.videos === 0
                ? <div style={{ color:'rgba(255,255,255,0.2)', fontSize:11 }}>No hay videos disponibles.</div>
                : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {Array.from({length:Math.min(player.videos,2)}).map((_,i) => (
                      <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:9, aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)' }} />
                        <div style={{ width:36, height:36, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, zIndex:1 }}>▶</div>
                        <div style={{ position:'absolute', bottom:7, left:10, color:'rgba(255,255,255,0.5)', fontSize:9, zIndex:1 }}>{i === 0 ? 'YouTube' : 'Propio'}</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Club actual */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Club actual</OcSectionTitle>
              <div style={{ color:'#fff', fontSize:14, fontWeight:500 }}>{player.currentClub || 'Libre'}</div>
              <div style={{ color:'rgba(255,255,255,0.25)', fontSize:10, marginTop:3 }}>Categoría: {player.ageRange} años</div>
            </div>

            {/* Photos */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Fotos ({player.photos})</OcSectionTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {Array.from({length:Math.min(player.photos,4)}).map((_,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:7, aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.15)', fontSize:18 }}>📷</div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ background:`${accent}0A`, border:`0.5px solid ${accent}25`, borderRadius:12, padding:'16px' }}>
              <OcSectionTitle>Contacto</OcSectionTitle>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, lineHeight:1.6, marginBottom:12 }}>Para contactar a este jugador, iniciá sesión o registrá tu institución.</p>
              <OcButton variant="primary" size="sm" style={{ width:'100%', justifyContent:'center' }}>Contactar</OcButton>
            </div>
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

Object.assign(window, { PlayersListScreen, PlayerProfileScreen });
