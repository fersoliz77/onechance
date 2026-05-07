import type { ClubProfile } from '@/types'
import EntityCardShell from '@/components/patterns/EntityCardShell'

type Props = {
  club: ClubProfile
  onClick: () => void
}

export default function ClubCard({ club, onClick }: Props) {
  const talentLabel = club.seeking && club.seeking.length > 0
    ? club.seeking.slice(0, 2).join(' · ')
    : 'Sin busqueda activa'
  const cover = club.imageUrl || ''

  return (
    <EntityCardShell onClick={onClick} tone="yellow" className="min-h-0 overflow-hidden rounded-[var(--oc-radius-xl)] bg-[rgba(7,20,24,0.78)] p-0 shadow-[0_0_0_1px_rgba(0,212,255,0.04),0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="grid lg:grid-cols-[240px_1fr_260px]">
        <div
          className="relative flex min-h-[130px] items-center justify-center border-b border-[var(--oc-border-soft)] px-5 py-5 lg:min-h-[158px] lg:border-b-0 lg:border-r"
          style={{
            borderColor: 'var(--oc-border-soft)',
            background: cover
              ? `linear-gradient(145deg, rgba(7,16,26,0.45), rgba(7,16,26,0.75)), url(${cover}) center/cover`
              : 'radial-gradient(circle at 72% 20%, rgba(255,255,255,0.16), transparent 28%), linear-gradient(145deg, #07101A, #142131 58%, #2A1E07)',
          }}
        >
          <div className="relative z-10 grid h-[86px] w-[86px] place-items-center rounded-[22px] border border-[rgba(255,180,0,0.34)] bg-[rgba(255,180,0,0.12)] text-[27px] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            🏟️
          </div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(160deg,transparent_0_18px,rgba(255,255,255,0.04)_19px,transparent_20px)] opacity-60" />
        </div>

        <div className="border-b border-[var(--oc-border-soft)] px-5 py-4 lg:border-b-0 lg:border-r lg:px-6 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[21px] font-semibold tracking-[-0.03em] text-white">{club.name}</div>
              <div className="mt-1 text-[13px] text-[var(--oc-text-muted)]">{club.country || 'Sin pais'} · {club.city || 'Sin ciudad'}</div>
            </div>
            <span className="rounded-md border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.12)] px-2.5 py-1 text-[12px] font-medium text-oc-yellow">
              {club.division || 'Sin categoria'}
            </span>
          </div>
          <div className="mt-4 grid gap-2 text-[13px] text-[var(--oc-text-muted)] lg:grid-cols-2">
            <p><span className="text-[var(--oc-text-faint)]">Fundacion:</span> {club.founded > 0 ? club.founded : 'N/D'}</p>
            <p><span className="text-[var(--oc-text-faint)]">Presidencia:</span> {club.president || 'N/D'}</p>
            <p><span className="text-[var(--oc-text-faint)]">DT:</span> {club.currentCoach || 'No informado'}</p>
            <p><span className="text-[var(--oc-text-faint)]">Talento buscado:</span> {talentLabel}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:flex-col lg:items-start lg:justify-center lg:px-6">
          <div>
            <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--oc-text-faint)]">Estado del perfil</p>
            <p className="mt-1 text-[14px] text-white">Verificado y publicado</p>
          </div>
          <span className="ml-auto text-[13px] text-[var(--oc-text-faint)] transition-colors group-hover:text-oc-yellow lg:ml-0">Ver perfil →</span>
      </div>
      </div>
    </EntityCardShell>
  )
}
