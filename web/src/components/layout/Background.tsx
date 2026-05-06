interface Props { scanlines?: boolean }

export default function Background({ scanlines = false }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[url('/images/hero-stadium.png')] bg-cover bg-[center_30%]" />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.4)_0%,rgba(10,10,10,0.14)_22%,rgba(10,10,10,0.32)_70%,#0A0A0A_100%)]" />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.46)_0%,rgba(10,10,10,0.14)_36%,rgba(10,10,10,0.4)_100%)]" />
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
