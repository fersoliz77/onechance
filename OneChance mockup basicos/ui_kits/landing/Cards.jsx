// Cards.jsx — Player card, Coach card, Mini badge
function PlayerCard({ name, position, country, age, stats, animated = true }) {
  return (
    <div style={{
      width: 210,
      background: 'linear-gradient(145deg, #0C1F12, #060F09)',
      border: '0.5px solid rgba(0,200,83,0.22)',
      borderRadius: '16px 4px 16px 16px',
      overflow: 'hidden',
      position: 'relative',
      clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)',
      animation: animated ? 'oc-float 6s ease-in-out infinite' : 'none',
    }}>
      {/* Top accent bar */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #00C853, rgba(0,200,83,0.15))' }} />
      <div style={{ padding: '14px 18px 18px' }}>
        <div style={{
          background: '#00C853', color: '#002A12',
          fontSize: 8, fontWeight: 500, padding: '3px 10px',
          borderRadius: 10, letterSpacing: '0.07em',
          display: 'inline-block', marginBottom: 12
        }}>★ DESTACADO</div>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00C853, #003A18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, border: '1.5px solid rgba(0,200,83,0.35)', marginBottom: 8
        }}>⚽</div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{name}</div>
        <div style={{ color: 'rgba(0,200,83,0.75)', fontSize: 10, marginTop: 2, marginBottom: 12 }}>
          {position} · {country} · {age} años
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(0,200,83,0.06)', borderRadius: 6, padding: '7px 9px' }}>
              <div style={{ color: '#00C853', fontSize: 13, fontWeight: 500 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoachCard({ name, role, country, years, animated = true }) {
  return (
    <div style={{
      width: 170,
      background: '#0B1A2E',
      border: '0.5px solid rgba(80,140,255,0.2)',
      borderRadius: '4px 14px 14px 14px',
      padding: 14,
      transform: 'rotate(2deg)',
      animation: animated ? 'oc-float-slow 7s ease-in-out infinite' : 'none',
    }}>
      <div style={{ color: 'rgba(100,160,255,0.65)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
        Técnico verificado
      </div>
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{name}</div>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2, marginBottom: 10 }}>
        {role} · {country} · {years} años exp.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(80,140,255,0.08)', borderRadius: 6, padding: '6px 8px' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5A8FFF' }} />
        <span style={{ color: '#5A8FFF', fontSize: 10, fontWeight: 500 }}>Disponible</span>
      </div>
    </div>
  );
}

function MiniBadge({ icon, label, value, animated = true }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '0.5px solid rgba(255,255,255,0.09)',
      borderRadius: 10,
      padding: '9px 13px',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: animated ? 'oc-float-rev 5s ease-in-out infinite' : 'none',
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

Object.assign(window, { PlayerCard, CoachCard, MiniBadge });
