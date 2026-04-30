import type { AgentProfile } from '@/types'
import EntityCardShell from '@/components/patterns/EntityCardShell'

type Props = {
  agent: AgentProfile
  onClick: () => void
}

export default function AgentCard({ agent, onClick }: Props) {
  return (
    <EntityCardShell onClick={onClick} tone="purple">
      <div className="flex items-start gap-3 lg:gap-3.5 mb-3 lg:mb-3.5">
        <div
          className="w-[52px] h-[52px] lg:w-[58px] lg:h-[58px] rounded-full flex items-center justify-center text-[20px] lg:text-[22px] border-[1.5px] shrink-0"
          style={{ background: 'linear-gradient(135deg,#B464FF,#2A0A4A)', borderColor: 'rgba(180,100,255,0.4)' }}
        >
          🤝
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] lg:text-[15px] font-medium truncate">{agent.fullName}</div>
          <div className="text-[11px] lg:text-[12px] mt-0.5 text-oc-purple">{agent.agencyName || 'Independiente'}</div>
        </div>
        {agent.players > 0 && (
          <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0 bg-[rgba(180,100,255,0.12)] border border-[rgba(180,100,255,0.24)]">
            <div className="text-[16px] lg:text-[17px] font-medium leading-none text-oc-purple">{agent.players}</div>
            <div className="text-[var(--oc-text-faint)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">JUGAD.</div>
          </div>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[agent.nationality, ...(agent.markets || []).slice(0, 2)].filter(Boolean).map(t => (
          <span key={t} className="oc-meta-chip">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--oc-text-faint)] text-[11px]">{agent.countries > 0 ? `${agent.countries} países` : 'Mercado local'}</span>
        <span className="text-[12px] text-[var(--oc-text-faint)] transition-colors group-hover:text-oc-purple">Ver perfil →</span>
      </div>
    </EntityCardShell>
  )
}
