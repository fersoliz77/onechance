// AuthScreen.jsx — Login / Register / Role select / Profile form

const ROLES = [
  { id: 'player', icon: '⚽', title: 'Jugador / Jugadora', desc: 'Mostrá tu perfil a clubes y representantes.' },
  { id: 'coach', icon: '📋', title: 'Técnico', desc: 'Publicá tu experiencia y buscá nuevos proyectos.' },
  { id: 'club', icon: '🏟️', title: 'Club', desc: 'Presentá tu institución y buscá talento.' },
  { id: 'agent', icon: '🤝', title: 'Representante', desc: 'Mostrá tu agencia y los jugadores que representás.' },
];

function StepDots({ total, current }) {
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center', justifyContent:'center', marginBottom:24 }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ width: i === current ? 18 : 6, height:6, borderRadius:3, background: i === current ? '#00C853' : i < current ? 'rgba(0,200,83,0.4)' : 'rgba(255,255,255,0.1)', transition:'all 0.3s' }} />
      ))}
    </div>
  );
}

function LoginForm({ onSwitch, onLogin }) {
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [err, setErr] = React.useState('');

  const submit = () => {
    if (!email || !pass) { setErr('Completá todos los campos.'); return; }
    // Simulate admin login
    if (email === 'admin@onechance.com' && pass === 'admin') { onLogin({ email, role:'admin', name:'Admin' }); return; }
    onLogin({ email, role:'player', name:'Lucas Ferreira' });
  };

  return (
    <div>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>Bienvenido de vuelta</div>
      <div style={{ color:'#fff', fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginBottom:6 }}>Ingresá a tu cuenta</div>
      <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:24 }}>
        ¿No tenés cuenta? <span onClick={onSwitch} style={{ color:'#00C853', cursor:'pointer' }}>Registrate gratis</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        <OcInput placeholder="Correo electrónico" value={email} onChange={setEmail} type="email" />
        <OcInput placeholder="Contraseña" value={pass} onChange={setPass} type="password" />
      </div>

      {err && <div style={{ color:'#FF6060', fontSize:11, marginBottom:12 }}>{err}</div>}

      <OcButton variant="primary" onClick={submit} style={{ width:'100%', justifyContent:'center', marginBottom:12 }} size="lg">Ingresar →</OcButton>
      <div style={{ textAlign:'center' }}>
        <span style={{ color:'rgba(0,200,83,0.6)', fontSize:11, cursor:'pointer' }}>¿Olvidaste tu contraseña?</span>
      </div>
      <div style={{ marginTop:16, padding:'10px', background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:8, fontSize:10, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>
        💡 Ingresá como admin: <span style={{ color:'rgba(255,255,255,0.5)' }}>admin@onechance.com / admin</span>
      </div>
    </div>
  );
}

function RegisterForm({ onDone }) {
  const [step, setStep] = React.useState(0); // 0=creds 1=role 2=form 3=success
  const [creds, setCreds] = React.useState({ email:'', pass:'', confirm:'' });
  const [role, setRole] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [isMinor, setIsMinor] = React.useState(false);
  const [err, setErr] = React.useState('');

  const checkBirth = (v) => {
    setForm(f => ({...f, birthDate:v}));
    if (v) {
      const age = Math.floor((Date.now() - new Date(v)) / 31557600000);
      setIsMinor(age < 18);
    }
  };

  const step0Submit = () => {
    if (!creds.email || !creds.pass || !creds.confirm) { setErr('Completá todos los campos.'); return; }
    if (creds.pass !== creds.confirm) { setErr('Las contraseñas no coinciden.'); return; }
    setErr(''); setStep(1);
  };

  const step2Submit = () => {
    if (!form.fullName) { setErr('Ingresá tu nombre completo.'); return; }
    setErr(''); setStep(3);
    onDone({ email:creds.email, role, name:form.fullName, isMinor });
  };

  if (step === 3) return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ fontSize:44, marginBottom:16 }}>⚽</div>
      <div style={{ color:'#00C853', fontSize:20, fontWeight:500, letterSpacing:'-0.02em', marginBottom:8 }}>¡Perfil creado!</div>
      {isMinor
        ? <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, lineHeight:1.7, marginBottom:16 }}>Tu perfil está <span style={{ color:'#FFB400' }}>pendiente de revisión</span>.<br/>Al ser menor de 18 años, un administrador debe aprobarlo antes de que sea visible.</div>
        : <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, lineHeight:1.7, marginBottom:16 }}>Ya podés completar tu perfil y enviarlo a revisión para que sea visible en la plataforma.</div>
      }
      <OcBadge status={isMinor ? 'pending' : 'draft'} />
    </div>
  );

  return (
    <div>
      <StepDots total={3} current={step} />
      {step === 0 && <>
        <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>Paso 1 de 3</div>
        <div style={{ color:'#fff', fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginBottom:20 }}>Creá tu cuenta</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
          <OcInput placeholder="Correo electrónico" value={creds.email} onChange={v => setCreds(c=>({...c,email:v}))} type="email" />
          <OcInput placeholder="Contraseña" value={creds.pass} onChange={v => setCreds(c=>({...c,pass:v}))} type="password" />
          <OcInput placeholder="Confirmá tu contraseña" value={creds.confirm} onChange={v => setCreds(c=>({...c,confirm:v}))} type="password" />
        </div>
        {err && <div style={{ color:'#FF6060', fontSize:11, marginBottom:10 }}>{err}</div>}
        <OcButton variant="primary" onClick={step0Submit} style={{ width:'100%', justifyContent:'center' }} size="lg">Continuar →</OcButton>
      </>}

      {step === 1 && <>
        <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>Paso 2 de 3</div>
        <div style={{ color:'#fff', fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginBottom:6 }}>¿Quién sos?</div>
        <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:20 }}>Elegí tu rol para personalizar tu perfil.</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => { setRole(r.id); setStep(2); }}
              style={{ display:'flex', alignItems:'center', gap:14, background: role === r.id ? 'rgba(0,200,83,0.08)' : 'rgba(255,255,255,0.03)', border:`0.5px solid ${role === r.id ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:'13px 16px', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.15s' }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{r.icon}</span>
              <div>
                <div style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{r.title}</div>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, marginTop:2 }}>{r.desc}</div>
              </div>
              <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.2)', fontSize:13 }}>→</span>
            </button>
          ))}
        </div>
        <OcButton variant="ghost" onClick={() => setStep(0)} size="sm">← Atrás</OcButton>
      </>}

      {step === 2 && <>
        <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>Paso 3 de 3 · {ROLES.find(r=>r.id===role)?.title}</div>
        <div style={{ color:'#fff', fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginBottom:20 }}>Tus datos</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
          <OcInput placeholder="Nombre y apellido" value={form.fullName||''} onChange={v => setForm(f=>({...f,fullName:v}))} />
          <div>
            <div style={{ color:'rgba(255,255,255,0.25)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Fecha de nacimiento</div>
            <input type="date" value={form.birthDate||''} onChange={e => checkBirth(e.target.value)}
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'inherit', outline:'none', colorScheme:'dark' }} />
          </div>
          {isMinor && (
            <div style={{ background:'rgba(255,180,0,0.08)', border:'0.5px solid rgba(255,180,0,0.3)', borderRadius:9, padding:'10px 13px', display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ fontSize:14 }}>⚠️</span>
              <div style={{ color:'rgba(255,180,0,0.9)', fontSize:11, lineHeight:1.6 }}>Sos menor de 18 años. Tu perfil quedará en revisión hasta que un administrador lo apruebe manualmente.</div>
            </div>
          )}
          <OcSelect value={form.nationality||''} onChange={v => setForm(f=>({...f,nationality:v}))} options={[{value:'',label:'Nacionalidad'},...COUNTRIES.map(c=>({value:c,label:c}))]} />
          {role === 'player' && (
            <OcSelect value={form.position||''} onChange={v => setForm(f=>({...f,position:v}))} options={[{value:'',label:'Puesto principal'},...POSITIONS.map(p=>({value:p,label:p}))]} />
          )}
        </div>
        {err && <div style={{ color:'#FF6060', fontSize:11, marginBottom:10 }}>{err}</div>}
        <div style={{ display:'flex', gap:8 }}>
          <OcButton variant="outline" onClick={() => setStep(1)} style={{ flex:1, justifyContent:'center' }}>Atrás</OcButton>
          <OcButton variant="primary" onClick={step2Submit} style={{ flex:2, justifyContent:'center' }}>Crear perfil →</OcButton>
        </div>
      </>}
    </div>
  );
}

function AuthScreen({ navigate, onLogin, initialTab='login' }) {
  const [tab, setTab] = React.useState(initialTab);

  const handleLogin = (user) => { onLogin(user); navigate('/dashboard'); };
  const handleRegister = (user) => { onLogin(user); };

  return (
    <OcPageShell>
      <div style={{ minHeight:'calc(100vh - 56px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          {/* Tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:10, padding:4, marginBottom:28 }}>
            {[['login','Ingresar'],['register','Crear cuenta']].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'8px', borderRadius:7, border:'none', fontFamily:'inherit', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                background: tab === t ? '#00C853' : 'transparent',
                color: tab === t ? '#002A12' : 'rgba(255,255,255,0.35)' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Card */}
          <div style={{ background:'rgba(8,15,25,0.9)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px 28px 24px', backdropFilter:'blur(20px)' }}>
            {tab === 'login'
              ? <LoginForm onSwitch={() => setTab('register')} onLogin={handleLogin} />
              : <RegisterForm onDone={handleRegister} />
            }
          </div>
        </div>
      </div>
    </OcPageShell>
  );
}

Object.assign(window, { AuthScreen });
