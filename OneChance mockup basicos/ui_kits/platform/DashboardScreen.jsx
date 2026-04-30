// DashboardScreen.jsx — Private user dashboard

function DashSidebar({ section, setSection }) {
  const items = [
    { id:'overview', icon:'◉', label:'Mi perfil' },
    { id:'edit', icon:'✎', label:'Editar datos' },
    { id:'videos', icon:'▶', label:'Videos' },
    { id:'photos', icon:'□', label:'Fotos' },
    { id:'settings', icon:'⚙', label:'Configuración' },
  ];
  return (
    <aside style={{ width:200, flexShrink:0 }}>
      <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
        {items.map(item => (
          <div key={item.id} onClick={() => setSection(item.id)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', cursor:'pointer', transition:'all 0.15s',
              background: section === item.id ? 'rgba(0,200,83,0.08)' : 'transparent',
              borderBottom:'0.5px solid rgba(255,255,255,0.04)',
              borderLeft: section === item.id ? '2px solid #00C853' : '2px solid transparent' }}>
            <span style={{ color: section === item.id ? '#00C853' : 'rgba(255,255,255,0.25)', fontSize:13 }}>{item.icon}</span>
            <span style={{ color: section === item.id ? '#fff' : 'rgba(255,255,255,0.4)', fontSize:12, fontWeight: section === item.id ? 500 : 400 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ProfileStatusCard({ status, onSubmit }) {
  const s = STATUS_COLORS[status];
  const steps = [
    { id:'draft', label:'Borrador' },
    { id:'pending', label:'En revisión' },
    { id:'published', label:'Publicado' },
  ];
  const stepIdx = { draft:0, pending:1, published:2, rejected:0, hidden:2 };
  const currentStep = stepIdx[status] ?? 0;

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:`0.5px solid ${s.border}`, borderRadius:12, padding:'20px 22px', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:4 }}>Estado del perfil</div>
          <OcBadge status={status} />
        </div>
        {status === 'draft' && (
          <OcButton variant="primary" size="sm" onClick={onSubmit}>Enviar a revisión →</OcButton>
        )}
        {status === 'rejected' && (
          <OcButton variant="outline" size="sm" onClick={onSubmit}>Revisar y reenviar</OcButton>
        )}
      </div>
      {/* Progress steps */}
      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
        {steps.map((st, i) => (
          <React.Fragment key={st.id}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:500, background: i <= currentStep ? '#00C853' : 'rgba(255,255,255,0.08)', color: i <= currentStep ? '#002A12' : 'rgba(255,255,255,0.2)' }}>{i+1}</div>
              <span style={{ color: i <= currentStep ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', fontSize:9, whiteSpace:'nowrap' }}>{st.label}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:'1px', background: i < currentStep ? '#00C853' : 'rgba(255,255,255,0.08)', margin:'0 6px', marginBottom:16 }} />}
          </React.Fragment>
        ))}
      </div>
      {status === 'pending' && (
        <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(255,180,0,0.07)', border:'0.5px solid rgba(255,180,0,0.2)', borderRadius:8, color:'rgba(255,180,0,0.8)', fontSize:11 }}>
          Tu perfil está en revisión. Te avisaremos cuando sea aprobado.
        </div>
      )}
      {status === 'rejected' && (
        <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(255,60,60,0.07)', border:'0.5px solid rgba(255,60,60,0.2)', borderRadius:8, color:'rgba(255,80,80,0.9)', fontSize:11 }}>
          Tu perfil fue rechazado. Revisá la información y volvé a enviarlo.
        </div>
      )}
    </div>
  );
}

function CompletionBar({ value }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'16px 20px', marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>Completitud del perfil</span>
        <span style={{ color:'#00C853', fontSize:14, fontWeight:500 }}>{value}%</span>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${value}%`, background:'linear-gradient(90deg,#00C853,#00E660)', borderRadius:2, transition:'width 0.5s' }} />
      </div>
      <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
        {[['Datos básicos','✓',true],['Foto principal','✓',true],['Trayectoria','✓',true],['Videos','✗',false],['Características','✗',false]].map(([l,ic,done]) => (
          <span key={l} style={{ fontSize:9, color: done ? 'rgba(0,200,83,0.7)' : 'rgba(255,255,255,0.2)' }}>{ic} {l}</span>
        ))}
      </div>
    </div>
  );
}

function EditForm() {
  const [tab, setTab] = React.useState('basic');
  const [saved, setSaved] = React.useState(false);
  const tabs = [['basic','Datos básicos'],['career','Trayectoria'],['characteristics','Características']];

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'20px' }}>
      {/* Subtabs */}
      <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'8px 16px', background:'transparent', border:'none', borderBottom: tab===t ? '1.5px solid #00C853' : '1.5px solid transparent', color: tab===t ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:12, fontFamily:'inherit', cursor:'pointer', fontWeight: tab===t ? 500 : 400, marginBottom:'-0.5px' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['Nombre completo','Lucas Ferreira'],['Nacionalidad','Argentina'],['Altura (m)','1.78'],['Peso (kg)','72'],['Club actual','San Lorenzo'],['Contacto del club','sanloren@futbol.com.ar']].map(([l,v]) => (
            <div key={l}>
              <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{l}</div>
              <input defaultValue={v} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }} />
            </div>
          ))}
          <div>
            <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Puesto</div>
            <select defaultValue="Enganche" style={{ width:'100%', background:'#0C1525', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }}>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Pierna hábil</div>
            <select defaultValue="Der" style={{ width:'100%', background:'#0C1525', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }}>
              <option>Der</option><option>Izq</option><option>Ambas</option>
            </select>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Descripción / Biografía</div>
            <textarea defaultValue="Enganche técnico con excelente visión de juego. Formado en las inferiores de San Lorenzo." rows={3}
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
          </div>
        </div>
      )}

      {tab === 'career' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[{club:'San Lorenzo',years:'2022-act.'},{club:'Almagro',years:'2020-2022'}].map((c,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 140px 36px', gap:8, alignItems:'center' }}>
              <input defaultValue={c.club} placeholder="Club" style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }} />
              <input defaultValue={c.years} placeholder="Período" style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }} />
              <div style={{ width:32, height:32, borderRadius:7, background:'rgba(255,60,60,0.08)', border:'0.5px solid rgba(255,60,60,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,80,80,0.7)', fontSize:14 }}>×</div>
            </div>
          ))}
          <OcButton variant="green_outline" size="sm" style={{ alignSelf:'flex-start' }}>+ Agregar club</OcButton>
        </div>
      )}

      {tab === 'characteristics' && (
        <div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
            {['Visión de juego','Regate','Pase filtrado','Juego aéreo','Velocidad','Potencia','Liderazgo','Definición','Presión alta','Distribución'].map(c => {
              const active = ['Visión de juego','Regate','Pase filtrado','Juego aéreo'].includes(c);
              return (
                <div key={c} style={{ padding:'6px 13px', borderRadius:20, fontSize:10, cursor:'pointer', transition:'all 0.15s',
                  background: active ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.04)',
                  border:`0.5px solid ${active ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? '#00C853' : 'rgba(255,255,255,0.35)' }}>{c}</div>
              );
            })}
          </div>
          <div style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>Seleccionadas: 4 / máx. 6</div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16, gap:8 }}>
        <OcButton variant="outline" size="sm">Guardar borrador</OcButton>
        <OcButton variant="primary" size="sm" onClick={save}>{saved ? '✓ Guardado' : 'Guardar cambios'}</OcButton>
      </div>
    </div>
  );
}

function VideosSection() {
  const [videos, setVideos] = React.useState([
    { id:1, type:'embed', platform:'youtube', title:'Resumen temporada 2024', status:'active' },
    { id:2, type:'upload', platform:null, title:'Jugadas destacadas - Dic 2024', status:'active' },
  ]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [addType, setAddType] = React.useState('embed');
  const [url, setUrl] = React.useState('');
  const [title, setTitle] = React.useState('');

  const add = () => {
    if (!title) return;
    setVideos(v => [...v, { id:Date.now(), type:addType, platform: addType==='embed' ? 'youtube' : null, title, status:'active' }]);
    setUrl(''); setTitle(''); setShowAdd(false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ color:'#fff', fontSize:14, fontWeight:500 }}>Mis videos</div>
        <OcButton variant="primary" size="sm" onClick={() => setShowAdd(s=>!s)}>+ Agregar video</OcButton>
      </div>

      {showAdd && (
        <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:12, padding:16 }}>
          <div style={{ display:'flex', gap:6, marginBottom:12 }}>
            {[['embed','Enlace externo'],['upload','Subir archivo']].map(([t,l]) => (
              <button key={t} onClick={() => setAddType(t)}
                style={{ flex:1, padding:'7px', borderRadius:7, border:`0.5px solid ${addType===t ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.1)'}`, background: addType===t ? 'rgba(0,200,83,0.1)' : 'transparent', color: addType===t ? '#00C853' : 'rgba(255,255,255,0.35)', fontSize:11, fontFamily:'inherit', cursor:'pointer' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <OcInput placeholder="Título del video" value={title} onChange={setTitle} />
            {addType === 'embed'
              ? <OcInput placeholder="URL (YouTube, Vimeo, TikTok, Instagram)" value={url} onChange={setUrl} />
              : <div style={{ border:'1.5px dashed rgba(255,255,255,0.1)', borderRadius:9, padding:'20px', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:11, cursor:'pointer' }}>📁 Arrastrá tu video o hacé clic para seleccionar<br/><span style={{ fontSize:9, marginTop:4, display:'block' }}>Máx. 200 MB · MP4, MOV</span></div>
            }
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <OcButton variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancelar</OcButton>
            <OcButton variant="primary" size="sm" onClick={add}>Agregar</OcButton>
          </div>
        </div>
      )}

      {videos.map(v => (
        <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'12px 14px' }}>
          <div style={{ width:48, height:36, background:'rgba(255,255,255,0.06)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', fontSize:14, flexShrink:0 }}>▶</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:'#fff', fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.title}</div>
            <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, marginTop:2 }}>{v.type === 'embed' ? `Enlace · ${v.platform}` : 'Archivo propio'}</div>
          </div>
          <OcBadge status="published" />
          <OcButton variant="danger" size="sm" onClick={() => setVideos(vs => vs.filter(x => x.id !== v.id))}>×</OcButton>
        </div>
      ))}

      {videos.length === 0 && <div style={{ textAlign:'center', padding:'32px', color:'rgba(255,255,255,0.2)', fontSize:12 }}>No tenés videos cargados todavía.</div>}
    </div>
  );
}

function DashboardScreen({ user, navigate }) {
  const [section, setSection] = React.useState('overview');
  const [profileStatus, setProfileStatus] = React.useState('draft');
  const player = MOCK_PLAYERS[0];

  return (
    <OcPageShell>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>Panel privado</div>
          <h1 style={{ color:'#fff', fontSize:26, fontWeight:500, letterSpacing:'-0.02em' }}>Hola, {user?.name || 'Lucas'} 👋</h1>
        </div>

        <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <DashSidebar section={section} setSection={setSection} />

          <div style={{ flex:1 }}>
            {section === 'overview' && <>
              <ProfileStatusCard status={profileStatus} onSubmit={() => setProfileStatus('pending')} />
              <CompletionBar value={65} />
              {/* Quick stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {[['Visitas al perfil','47'],['Videos cargados','2'],['Fotos subidas','3']].map(([l,v]) => (
                  <div key={l} style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 16px', textAlign:'center' }}>
                    <div style={{ color:'#00C853', fontSize:22, fontWeight:500, letterSpacing:'-0.02em' }}>{v}</div>
                    <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, marginTop:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
                  </div>
                ))}
              </div>
            </>}

            {section === 'edit' && <EditForm />}
            {section === 'videos' && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'20px' }}>
                <VideosSection />
              </div>
            )}
            {section === 'photos' && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'20px' }}>
                <OcSectionTitle>Fotos del perfil</OcSectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                  {[...Array(3)].map((_,i) => (
                    <div key={i} style={{ aspectRatio:'1', background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'rgba(255,255,255,0.15)', position:'relative' }}>
                      📷
                      <div style={{ position:'absolute', top:6, right:6, width:20, height:20, borderRadius:5, background:'rgba(255,60,60,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, cursor:'pointer', color:'rgba(255,80,80,0.7)' }}>×</div>
                    </div>
                  ))}
                  <div style={{ aspectRatio:'1', border:'1.5px dashed rgba(255,255,255,0.1)', borderRadius:9, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.2)', fontSize:11, gap:6 }}>
                    <span style={{ fontSize:22 }}>+</span>
                    <span>Subir foto</span>
                  </div>
                </div>
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>3 fotos subidas · Máx. 10 fotos por perfil</div>
              </div>
            )}
            {section === 'settings' && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'20px' }}>
                <OcSectionTitle>Configuración</OcSectionTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[['Visibilidad del contacto','Mostrar datos de contacto públicamente'],['Perfil destacado','Activar visibilidad destacada (pago)'],['Notificaciones','Recibir alertas por email']].map(([t,d]) => (
                    <div key={t} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ color:'#fff', fontSize:12, fontWeight:500 }}>{t}</div>
                        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, marginTop:2 }}>{d}</div>
                      </div>
                      <div style={{ width:36, height:20, borderRadius:10, background:'rgba(0,200,83,0.3)', border:'0.5px solid rgba(0,200,83,0.4)', cursor:'pointer', position:'relative' }}>
                        <div style={{ position:'absolute', right:3, top:3, width:14, height:14, borderRadius:'50%', background:'#00C853' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

Object.assign(window, { DashboardScreen });
