// AdminScreen.jsx — Admin panel

function AdminSidebar({ section, setSection }) {
  const items = [
    { id:'overview', icon:'◈', label:'Resumen' },
    { id:'pending', icon:'⏳', label:'Pendientes', badge: 3 },
    { id:'users', icon:'◉', label:'Usuarios' },
    { id:'videos', icon:'▶', label:'Videos' },
    { id:'featured', icon:'★', label:'Destacados' },
  ];
  return (
    <aside style={{ width:200, flexShrink:0 }}>
      <div style={{ background:'rgba(255,180,0,0.04)', border:'0.5px solid rgba(255,180,0,0.15)', borderRadius:10, padding:'8px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12 }}>🔐</span>
        <span style={{ color:'rgba(255,180,0,0.8)', fontSize:10 }}>Panel de administración</span>
      </div>
      <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
        {items.map(item => (
          <div key={item.id} onClick={() => setSection(item.id)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', cursor:'pointer', transition:'all 0.15s',
              background: section === item.id ? 'rgba(255,180,0,0.07)' : 'transparent',
              borderBottom:'0.5px solid rgba(255,255,255,0.04)',
              borderLeft: section === item.id ? '2px solid #FFB400' : '2px solid transparent' }}>
            <span style={{ color: section === item.id ? '#FFB400' : 'rgba(255,255,255,0.25)', fontSize:12 }}>{item.icon}</span>
            <span style={{ color: section === item.id ? '#fff' : 'rgba(255,255,255,0.4)', fontSize:12, fontWeight: section === item.id ? 500 : 400, flex:1 }}>{item.label}</span>
            {item.badge && <span style={{ background:'rgba(255,180,0,0.2)', color:'#FFB400', fontSize:9, fontWeight:600, padding:'2px 6px', borderRadius:8 }}>{item.badge}</span>}
          </div>
        ))}
      </div>
    </aside>
  );
}

function AdminOverview() {
  const stats = [
    { label:'Usuarios totales', value:'142', sub:'+12 esta semana', color:'#00C853' },
    { label:'Perfiles publicados', value:'89', sub:'62% del total', color:'#00C853' },
    { label:'Pendientes de revisión', value:'3', sub:'Incluye 2 menores', color:'#FFB400' },
    { label:'Videos activos', value:'217', sub:'Embebidos + propios', color:'#5A8FFF' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 18px' }}>
            <div style={{ color:s.color, fontSize:28, fontWeight:500, letterSpacing:'-0.03em', lineHeight:1 }}>{s.value}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:5 }}>{s.label}</div>
            <div style={{ color:'rgba(255,255,255,0.2)', fontSize:10, marginTop:3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 18px' }}>
        <OcSectionTitle>Distribución por rol</OcSectionTitle>
        {[['Jugadores','112','78%','#00C853'],['Técnicos','14','10%','#5A8FFF'],['Clubes','9','6%','#FFB400'],['Representantes','7','5%','#B464FF']].map(([l,n,pct,c]) => (
          <div key={l} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>{l}</span>
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>{n}</span>
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
              <div style={{ height:'100%', width:pct, background:c, borderRadius:2, opacity:0.7 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingApprovals() {
  const [items, setItems] = React.useState([
    { id:6, name:'Ana Lima', role:'Jugadora', age:16, isMinor:true, country:'Paraguay', position:'Defensa', sentAt:'Hace 2 horas', note:'Menor de edad — requiere aprobación manual' },
    { id:99, name:'Carlos Ríos', role:'Técnico', age:34, isMinor:false, country:'Uruguay', position:'Entrenador', sentAt:'Hace 5 horas', note:'' },
    { id:100, name:'Club Atlético Norteño', role:'Club', age:null, isMinor:false, country:'Argentina', position:'Club · Primera C', sentAt:'Hace 1 día', note:'' },
  ]);
  const [selected, setSelected] = React.useState(null);

  const approve = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const reject  = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ color:'#fff', fontSize:14, fontWeight:500 }}>Pendientes de aprobación</div>
        <span style={{ background:'rgba(255,180,0,0.15)', color:'#FFB400', fontSize:10, padding:'3px 10px', borderRadius:10 }}>{items.length} pendientes</span>
      </div>
      {items.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.2)', fontSize:12 }}>Sin pendientes. ✓</div>}
      {items.map(item => (
        <div key={item.id} style={{ background:'rgba(255,255,255,0.02)', border:`0.5px solid ${item.isMinor ? 'rgba(255,180,0,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius:12, padding:'16px', transition:'all 0.15s' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
              {item.role === 'Jugadora' || item.role === 'Jugador' ? '⚽' : item.role === 'Técnico' ? '📋' : '🏟️'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{item.name}</span>
                <span style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', fontSize:9, padding:'2px 8px', borderRadius:7 }}>{item.role}</span>
                {item.isMinor && <span style={{ background:'rgba(255,180,0,0.15)', color:'#FFB400', fontSize:9, padding:'2px 8px', borderRadius:7 }}>⚠ MENOR DE EDAD</span>}
              </div>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, marginTop:3 }}>{item.position} · {item.country}{item.age ? ` · ${item.age} años` : ''}</div>
              {item.note && <div style={{ color:'rgba(255,180,0,0.7)', fontSize:10, marginTop:5, padding:'5px 9px', background:'rgba(255,180,0,0.06)', borderRadius:6 }}>{item.note}</div>}
              <div style={{ color:'rgba(255,255,255,0.15)', fontSize:9, marginTop:5 }}>Enviado {item.sentAt}</div>
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <OcButton variant="primary" size="sm" onClick={() => approve(item.id)}>✓ Aprobar</OcButton>
              <OcButton variant="danger" size="sm" onClick={() => reject(item.id)}>Rechazar</OcButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserTable() {
  const [search, setSearch] = React.useState('');
  const allUsers = [
    ...MOCK_PLAYERS.map(p => ({ ...p, role:'Jugador/a', email:`${p.fullName.split(' ')[0].toLowerCase()}@mail.com` })),
    ...MOCK_COACHES.map(c => ({ ...c, role:'Técnico', email:`${c.fullName.split(' ')[0].toLowerCase()}@mail.com` })),
  ];
  const visible = allUsers.filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <OcInput placeholder="Buscar usuario..." value={search} onChange={setSearch} icon="🔍" style={{ marginBottom:14 }} />
      <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 90px 80px', padding:'10px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
          {['Nombre','Rol','País','Estado','Acciones'].map(h => <span key={h} style={{ color:'rgba(255,255,255,0.2)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</span>)}
        </div>
        {visible.map((u,i) => (
          <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 90px 80px', padding:'11px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.04)', alignItems:'center' }}>
            <div>
              <div style={{ color:'#fff', fontSize:12 }}>{u.fullName}</div>
              <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, marginTop:1 }}>{u.email}</div>
            </div>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:10 }}>{u.role}</span>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:10 }}>{u.nationality}</span>
            <OcBadge status={u.status || 'published'} />
            <div style={{ display:'flex', gap:5 }}>
              <div style={{ padding:'4px 8px', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:5, cursor:'pointer', color:'rgba(255,255,255,0.35)', fontSize:10 }}>✎</div>
              <div style={{ padding:'4px 8px', background:'rgba(255,60,60,0.06)', border:'0.5px solid rgba(255,60,60,0.15)', borderRadius:5, cursor:'pointer', color:'rgba(255,80,80,0.6)', fontSize:10 }}>×</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoModeration() {
  const [videos, setVideos] = React.useState([
    { id:1, player:'Lucas Ferreira', title:'Resumen temporada 2024', type:'embed', platform:'YouTube', status:'active' },
    { id:2, player:'Camila Ríos', title:'Highlight UCup 2024', type:'upload', platform:null, status:'active' },
    { id:3, player:'Diego Méndez', title:'Atajadas - Temporada 23', type:'embed', platform:'Vimeo', status:'active' },
    { id:4, player:'Rodrigo Paredes', title:'Goles - Liga 2024', type:'embed', platform:'TikTok', status:'active' },
  ]);

  const toggle = (id) => setVideos(vs => vs.map(v => v.id===id ? {...v, status: v.status==='active' ? 'hidden' : 'active'} : v));
  const remove = (id) => setVideos(vs => vs.filter(v => v.id!==id));

  return (
    <div>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:10, marginBottom:12 }}>{videos.length} videos · Podés ocultar o eliminar cualquier video de cualquier perfil.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {videos.map(v => (
          <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'12px 14px' }}>
            <div style={{ width:48, height:36, background:'rgba(255,255,255,0.05)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.25)', fontSize:14, flexShrink:0 }}>▶</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'#fff', fontSize:12, fontWeight:500 }}>{v.title}</div>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, marginTop:1 }}>{v.player} · {v.type==='embed' ? v.platform : 'Propio'}</div>
            </div>
            <span style={{ padding:'3px 9px', borderRadius:8, fontSize:9, fontWeight:500, background: v.status==='active' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)', color: v.status==='active' ? '#00C853' : 'rgba(255,255,255,0.3)', border:`0.5px solid ${v.status==='active' ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.1)'}` }}>{v.status==='active' ? 'Activo' : 'Oculto'}</span>
            <div style={{ display:'flex', gap:6 }}>
              <OcButton variant="outline" size="sm" onClick={() => toggle(v.id)}>{v.status==='active' ? 'Ocultar' : 'Mostrar'}</OcButton>
              <OcButton variant="danger" size="sm" onClick={() => remove(v.id)}>Eliminar</OcButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedManager() {
  const [featured, setFeatured] = React.useState(MOCK_PLAYERS.filter(p => p.isFeatured).map(p => p.id));

  return (
    <div>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:10, marginBottom:12 }}>Los jugadores destacados aparecen con badge y prioridad en el listado público.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {MOCK_PLAYERS.filter(p => p.status==='published').map(p => {
          const isFeat = featured.includes(p.id);
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.02)', border:`0.5px solid ${isFeat ? 'rgba(0,200,83,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius:10, padding:'11px 14px' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${p.gender==='F' ? '#B464FF,#3A1A5A' : '#00C853,#003A18'})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{p.gender==='F' ? '👩' : '👤'}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontSize:12, fontWeight:500 }}>{p.fullName}</div>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, marginTop:1 }}>{p.position} · {p.nationality}</div>
              </div>
              <span style={{ color:'#00C853', fontSize:13, fontWeight:500 }}>{p.overall}</span>
              <OcButton variant={isFeat ? 'primary' : 'outline'} size="sm" onClick={() => setFeatured(f => isFeat ? f.filter(x=>x!==p.id) : [...f,p.id])}>
                {isFeat ? '★ Destacado' : '☆ Destacar'}
              </OcButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminScreen({ user, navigate }) {
  const [section, setSection] = React.useState('overview');

  return (
    <OcPageShell>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ color:'rgba(255,180,0,0.6)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>Panel administrador</div>
          <h1 style={{ color:'#fff', fontSize:26, fontWeight:500, letterSpacing:'-0.02em' }}>One Chance Admin</h1>
        </div>
        <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <AdminSidebar section={section} setSection={setSection} />
          <div style={{ flex:1 }}>
            {section === 'overview'  && <AdminOverview />}
            {section === 'pending'   && <PendingApprovals />}
            {section === 'users'     && <UserTable />}
            {section === 'videos'    && <VideoModeration />}
            {section === 'featured'  && <FeaturedManager />}
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

Object.assign(window, { AdminScreen });
