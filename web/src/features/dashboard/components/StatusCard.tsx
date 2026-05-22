'use client'

import { useMemo } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import SurfaceCard from '@/components/ui/SurfaceCard'
import { calcCompletion } from '@/lib/profileCompletion'
import { MIN_COMPLETION_TO_SUBMIT } from '@/lib/constants'
import type { ProfileState, Role } from '@/types'
import type { AnyProfile } from '@/features/dashboard/types'

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#00C853' : pct >= 50 ? '#FFB400' : '#FF6060'
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[rgba(255,255,255,0.35)] text-[12px]">Completud del perfil</span>
        <span className="text-[12px]" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-[4px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function StatusCard({
  profile, role, onSubmit,
}: { profile: AnyProfile; state: ProfileState | null; role: Role; onSubmit: () => void }) {
  const status = profile.status
  const { pct, missing } = useMemo(() => calcCompletion(profile, role), [profile, role])
  const canSubmit = pct >= MIN_COMPLETION_TO_SUBMIT

  return (
    <SurfaceCard className="oc-dashboard-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white text-[14px] font-medium">Estado del perfil</span>
        <Badge status={status} />
      </div>
      <CompletionBar pct={pct} />

      {missing.length > 0 && (
        <div className="mt-3 rounded-[8px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] px-3 py-2.5">
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-1.5">Falta completar</div>
          <div className="flex flex-col gap-1">
            {missing.slice(0, 5).map(m => (
              <div key={m} className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.45)]">
                <span className="w-[5px] h-[5px] rounded-full bg-[rgba(255,100,100,0.6)] shrink-0" />
                {m}
              </div>
            ))}
            {missing.length > 5 && (
              <div className="text-[11px] text-[rgba(255,255,255,0.25)] mt-0.5">+{missing.length - 5} mas</div>
            )}
          </div>
        </div>
      )}

      {(status === 'draft' || status === 'rejected') && (
        <div className="mt-4">
          {status === 'rejected' && (
            <div className="mb-3">
              <p className="text-[rgba(255,60,60,0.7)] text-[13px]">Tu perfil fue rechazado. Corregí los datos y volvé a enviarlo.</p>
              {profile.rejectionReason && (
                <div className="mt-2 rounded-lg border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.05)] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.07em] text-[rgba(255,100,100,0.5)] mb-1">Motivo del rechazo</p>
                  <p className="text-[12px] text-[rgba(255,180,180,0.85)] leading-[1.5]">{profile.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          {status === 'draft' && (
            <p className="text-[rgba(255,255,255,0.35)] text-[13px] mb-3">
              {canSubmit
                ? 'Tu perfil esta listo para enviarse a revision.'
                : `Completa al menos el ${MIN_COMPLETION_TO_SUBMIT}% del perfil antes de enviar.`}
            </p>
          )}
          <Button
            variant="primary" size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="w-full justify-center"
            title={!canSubmit ? `Necesitas ${MIN_COMPLETION_TO_SUBMIT}% de completud para enviar` : undefined}
          >
            {status === 'rejected' ? 'Reenviar a revision ->' : 'Enviar a revision ->'}
          </Button>
        </div>
      )}
      {status === 'pending' && (
        <p className="text-[rgba(255,180,0,0.7)] text-[13px] mt-3">Tu perfil esta siendo revisado. Te notificaremos cuando sea aprobado.</p>
      )}
      {status === 'published' && (
        <p className="text-[rgba(0,200,83,0.7)] text-[13px] mt-3">Tu perfil esta publicado y visible en la plataforma.</p>
      )}
    </SurfaceCard>
  )
}
