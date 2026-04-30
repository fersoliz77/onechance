// Ticker.jsx — Scrolling player feed
function Ticker() {
  const items = [
    { brand: true, name: 'ONE CHANCE' },
    { pos: 'ENG', name: 'Lucas F.', country: 'ARG' },
    { pos: 'MED', name: 'Camila R.', country: 'URU' },
    { pos: 'ARQ', name: 'Diego M.', country: 'BRA' },
    { pos: 'LAT', name: 'Valentina S.', country: 'CHI' },
    { pos: 'ENG', name: 'Rodrigo P.', country: 'COL' },
    { pos: 'DEF', name: 'Ana L.', country: 'PAR' },
    { brand: true, name: 'ONE CHANCE' },
    { pos: 'ENG', name: 'Lucas F.', country: 'ARG' },
    { pos: 'MED', name: 'Camila R.', country: 'URU' },
    { pos: 'ARQ', name: 'Diego M.', country: 'BRA' },
    { pos: 'LAT', name: 'Valentina S.', country: 'CHI' },
    { pos: 'ENG', name: 'Rodrigo P.', country: 'COL' },
    { pos: 'DEF', name: 'Ana L.', country: 'PAR' },
  ];
  return (
    <div style={{
      overflow: 'hidden', height: 34,
      borderTop: '0.5px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center',
      background: 'rgba(0,0,0,0.25)',
    }}>
      <div style={{ display: 'flex', animation: 'oc-ticker 22s linear infinite', whiteSpace: 'nowrap' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 28px',
            color: 'rgba(255,255,255,0.2)', fontSize: 10,
            borderRight: '0.5px solid rgba(255,255,255,0.04)'
          }}>
            <div style={{ width: 3, height: 3, background: 'rgba(0,200,83,0.5)', borderRadius: '50%' }} />
            {item.brand
              ? <span style={{ color: '#00C853', fontWeight: 500, letterSpacing: '0.04em' }}>{item.name}</span>
              : <span>{item.name} · <span style={{ color: 'rgba(0,200,83,0.6)' }}>{item.pos}</span> · {item.country}</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
Object.assign(window, { Ticker });
