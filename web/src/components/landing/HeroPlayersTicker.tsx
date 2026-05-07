import type { PlayerProfile } from '@/types'

type HeroPlayersTickerProps = {
  players: PlayerProfile[]
  visible: boolean
  className?: string
  durationSeconds?: number
}

/**
 * Minimal bottom ticker for player identity data.
 * - Infinite seamless loop via duplicated track
 * - Premium subtle motion (slow pace + soft fades)
 * - Pauses on hover for desktop scanning
 */
export default function HeroPlayersTicker({
  players,
  visible,
  className,
  durationSeconds = 64,
}: HeroPlayersTickerProps) {
  if (!players.length) return null

  const track = [...players, ...players]

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-0 z-30 border-t border-white/10',
        'bg-[linear-gradient(180deg,rgba(12,12,12,0.36)_0%,rgba(8,8,8,0.46)_100%)] backdrop-blur-[10px]',
        'transition-all duration-500 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0',
        className ?? '',
      ].join(' ')}
      aria-label="Galeria movil de jugadores"
    >
      <div className="oc-shell">
        <div className="group overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_7%,black_93%,transparent)]">
          <div
            className="flex w-max items-center gap-3 whitespace-nowrap text-[13px] font-[500] tracking-[0.005em] text-white/80 motion-reduce:animate-none md:text-[14px] md:group-hover:[animation-play-state:paused]"
            style={{ animation: `oc-ticker-loop ${durationSeconds}s linear infinite` }}
          >
            {track.map((player, index) => (
              <div key={`${player.uid}-${index}`} className="inline-flex items-center gap-3">
                <span className="text-white/90">{player.fullName}</span>
                <span className="text-white/62">{player.position}</span>
                <span className="text-white/56">{player.nationality}</span>
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--oc-lime)] shadow-[0_0_8px_rgba(170,255,0,0.45)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
