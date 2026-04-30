// RoleStrip.jsx — Role selector tags + position pills
function RoleStrip({ onSelect }) {
  const [active, setActive] = React.useState(null);
  const roles = [
    { icon: '⚽', label: 'Soy jugador / jugadora' },
    { icon: '📋', label: 'Soy técnico' },
    { icon: '🏟️', label: 'Represento un club' },
    { icon: '🤝', label: 'Soy representante' },
  ];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '20px 40px 0', flexWrap: 'wrap' }}>
      {roles.map(r => (
        <button key={r.label}
          onClick={() => { setActive(r.label); onSelect && onSelect(r.label); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: active === r.label ? 'rgba(0,200,83,0.07)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${active === r.label ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 8, padding: '10px 18px',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}>
          <span style={{ fontSize: 14 }}>{r.icon}</span>
          <span style={{ color: active === r.label ? '#00C853' : 'rgba(255,255,255,0.4)', fontSize: 11, transition: 'color 0.2s' }}>{r.label}</span>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginLeft: 4 }}>→</span>
        </button>
      ))}
    </div>
  );
}

function PositionPills({ active }) {
  const positions = ['Delantero', 'Arquero', 'Volante', 'Defensa', 'Lateral'];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {positions.map(p => (
        <div key={p} style={{
          background: p === active ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.03)',
          border: `0.5px solid ${p === active ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.07)'}`,
          color: p === active ? '#00C853' : 'rgba(255,255,255,0.2)',
          fontSize: 9, padding: '4px 12px', borderRadius: 20,
          letterSpacing: '0.04em', whiteSpace: 'nowrap'
        }}>{p}</div>
      ))}
    </div>
  );
}

Object.assign(window, { RoleStrip, PositionPills });
