import type { PlayerProfile } from '@/types'
import EntityCardShell from '@/components/patterns/EntityCardShell'

type Props = {
  player: PlayerProfile
  onClick: () => void
}

export default function PlayerCard({ player, onClick }: Props) {
  const isFemale = player.gender === 'F'
  const accent = isFemale ? '#B464FF' : '#00C853'

  return (
    <EntityCardShell onClick={onClick} tone="green">
      {player.isFeatured && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-oc-green to-[rgba(0,200,83,0.2)]" />}
      <div className="flex items-start gap-3 lg:gap-3.5 mb-3 lg:mb-3.5">
        <div
          className="w-[52px] h-[52px] lg:w-[58px] lg:h-[58px] rounded-full flex items-center justify-center text-[20px] lg:text-[22px] border-[1.5px] shrink-0"
          style={{ background: `linear-gradient(135deg,${accent},${isFemale ? '#3A1A5A' : '#003A18'})`, borderColor: `${accent}66` }}
        >
          {isFemale ? '👩' : '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white text-[14px] lg:text-[15px] font-medium">{player.fullName}</span>
            {player.isFeatured && <span className="bg-oc-green text-oc-green-dark text-[8px] font-medium px-[7px] py-[2px] rounded-[8px] tracking-[0.06em]">★ DEST.</span>}
          </div>
          <div className="text-[11px] lg:text-[12px] mt-0.5" style={{ color: accent }}>{player.position}</div>
        </div>
        <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0" style={{ background: `${accent}1A` }}>
          <div className="text-[16px] lg:text-[17px] font-medium leading-none" style={{ color: accent }}>{player.overall || '—'}</div>
          <div className="text-[var(--oc-text-faint)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">OVR</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[player.nationality, `${player.ageRange} años`, player.strongFoot === 'Der' ? '🦶Der' : '🦶Izq'].map(t => (
          <span key={t} className="oc-meta-chip">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--oc-text-faint)] text-[11px]">{player.currentClub || 'Libre'}</span>
        <span className="text-[12px] text-[var(--oc-text-faint)] transition-colors group-hover:text-oc-green">Ver perfil →</span>
      </div>
    </EntityCardShell>
  )
}
