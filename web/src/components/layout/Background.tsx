interface Props { scanlines?: boolean }

export default function Background({ scanlines = false }: Props) {
  return (
    <>
      {/* Base */}
      <div className="fixed inset-0 z-0 bg-oc-bg" />
      {/* Animated grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none animate-grid-scroll"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,200,83,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,83,0.03) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Orb green */}
      <div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 animate-pulse-orb"
        style={{ background: 'rgba(0,200,83,0.07)', filter: 'blur(90px)', top: -100, left: -80 }}
      />
      {/* Orb blue */}
      <div
        className="fixed w-[260px] h-[260px] rounded-full pointer-events-none z-0 animate-pulse-orb"
        style={{ background: 'rgba(0,100,255,0.06)', filter: 'blur(70px)', bottom: 60, right: -40, animationDelay: '1s', animationDirection: 'reverse' }}
      />
      {/* Scanlines (landing only) */}
      {scanlines && (
        <div
          className="fixed inset-0 z-[50] pointer-events-none"
          style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px)' }}
        />
      )}
    </>
  )
}
