import type { CoachProfile } from '@/types'
import EntityCardShell from '@/components/patterns/EntityCardShell'

type Props = {
  coach: CoachProfile
  onClick: () => void
}

export default function CoachCard({ coach, onClick }: Props) {
  return (
    <EntityCardShell onClick={onClick} tone="blue">
      <div className="flex items-start gap-3 lg:gap-3.5 mb-3 lg:mb-3.5">
        <div
          className="w-[52px] h-[52px] lg:w-[58px] lg:h-[58px] rounded-full flex items-center justify-center text-[20px] lg:text-[22px] border-[1.5px] shrink-0"
          style={{ background: 'linear-gradient(135deg,#5A8FFF,#0B1A3A)', borderColor: 'rgba(90,143,255,0.4)' }}
        >
          📋
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] lg:text-[15px] font-medium truncate">{coach.fullName}</div>
          <div className="text-[11px] lg:text-[12px] mt-0.5 text-oc-blue">{coach.currentClub || 'Sin club actual'}</div>
        </div>
          <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0 bg-[rgba(90,143,255,0.12)] border border-[rgba(90,143,255,0.24)]">
            <div className="text-[16px] lg:text-[17px] font-medium leading-none text-oc-blue">{coach.years || '—'}</div>
            <div className="text-[var(--oc-text-faint)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">AÑOS</div>
          </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[coach.nationality, ...(coach.skills || []).slice(0, 2)].filter(Boolean).map(t => (
          <span key={t} className="oc-meta-chip">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--oc-text-faint)] text-[11px]">{(coach.languages || []).join(' · ') || 'Español'}</span>
        <span className="text-[12px] text-[var(--oc-text-faint)] transition-colors group-hover:text-oc-blue">Ver perfil →</span>
      </div>
    </EntityCardShell>
  )
}
