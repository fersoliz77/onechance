import type { ClubProfile } from '@/types'
import EntityCardShell from '@/components/patterns/EntityCardShell'

type Props = {
  club: ClubProfile
  onClick: () => void
}

export default function ClubCard({ club, onClick }: Props) {
  return (
    <EntityCardShell onClick={onClick} tone="yellow">
      <div className="flex items-start gap-3 lg:gap-3.5 mb-3 lg:mb-3.5">
        <div
          className="w-[52px] h-[52px] lg:w-[58px] lg:h-[58px] rounded-full flex items-center justify-center text-[22px] lg:text-[24px] border-[1.5px] shrink-0"
          style={{ background: 'linear-gradient(135deg,#FFB400,#3A2800)', borderColor: 'rgba(255,180,0,0.4)' }}
        >
          🏟️
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] lg:text-[15px] font-medium truncate">{club.name}</div>
          <div className="text-[11px] lg:text-[12px] mt-0.5 text-oc-yellow">{club.division || 'Sin categoría'}</div>
        </div>
        {club.founded > 0 && (
          <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0 bg-[rgba(255,180,0,0.12)] border border-[rgba(255,180,0,0.24)]">
            <div className="text-[14px] lg:text-[15px] font-medium leading-none text-oc-yellow">{club.founded}</div>
            <div className="text-[var(--oc-text-faint)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">FUND.</div>
          </div>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[club.country, club.city, club.province].filter(Boolean).map(t => (
          <span key={t} className="oc-meta-chip">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--oc-text-faint)] text-[11px]">
          {club.seeking && club.seeking.length > 0 ? `Busca: ${club.seeking.slice(0, 2).join(', ')}` : 'No especifica búsqueda'}
        </span>
        <span className="text-[12px] text-[var(--oc-text-faint)] transition-colors group-hover:text-oc-yellow">Ver perfil →</span>
      </div>
    </EntityCardShell>
  )
}
