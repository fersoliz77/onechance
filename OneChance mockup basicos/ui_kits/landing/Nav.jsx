// Nav.jsx — One Chance navigation bar
function Nav({ onLogin, onRegister }) {
  const [hovered, setHovered] = React.useState(null);
  const links = ['Jugadores', 'Técnicos', 'Clubes', 'Representantes'];
  return (
    <nav style={{
      position: 'relative', zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 40px',
      borderBottom: '0.5px solid rgba(255,255,255,0.05)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ color: '#fff', fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>ONE</span>
        <div style={{
          width: 5, height: 5, background: '#00C853', borderRadius: '50%',
          margin: '0 1px 1px', alignSelf: 'flex-end',
          animation: 'oc-blink 2s infinite'
        }} />
        <span style={{ color: '#00C853', fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>CHANCE</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 28 }}>
        {links.map(l => (
          <a key={l} href="#"
            onMouseEnter={() => setHovered(l)}
            onMouseLeave={() => setHovered(null)}
            style={{
              color: hovered === l ? '#fff' : 'rgba(255,255,255,0.35)',
              fontSize: 12, textDecoration: 'none',
              transition: 'color 0.2s'
            }}>{l}</a>
        ))}
      </div>

      {/* Auth */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={onLogin} style={{
          background: 'transparent',
          border: '0.5px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.6)', fontSize: 12,
          padding: '8px 16px', borderRadius: 7, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.2s'
        }}>Ingresar</button>
        <button onClick={onRegister} style={{
          background: '#00C853', color: '#002A12',
          fontSize: 12, fontWeight: 500,
          padding: '8px 18px', borderRadius: 7, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s'
        }}>Publicar perfil</button>
      </div>
    </nav>
  );
}
Object.assign(window, { Nav });
