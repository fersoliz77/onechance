'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { getAgent } from '@/lib/firestore'
import type { AgentProfile } from '@/types'

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { getAgent(id).then(a => { setAgent(a); setLoading(false) }) }, [id])

  if (loading) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  if (!agent) return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Representante no encontrado.</div></div>

  const accent = '#B464FF'

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14">
        <div className="max-w-[960px] mx-auto px-6 py-8">
          <Button variant="ghost" onClick={() => router.push('/representantes')} className="mb-5 text-[11px]">← Volver al listado</Button>

          {/* Hero card */}
          <div
            className="mb-4 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,#1A0A2E,#0B0518)',
              border: `0.5px solid ${accent}40`,
              borderRadius: '20px 4px 20px 20px',
              clipPath: 'polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%)',
            }}
          >
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg,${accent},rgba(0,0,0,0))` }} />
            <div className="flex items-stretch">
              {/* Left panel */}
              <div className="w-[220px] shrink-0 p-8 flex flex-col items-center justify-center relative"
                style={{ background: `linear-gradient(160deg,${accent}18,rgba(0,0,0,0))`, borderRight: `0.5px solid ${accent}22` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] opacity-[0.07]">
                  <svg viewBox="0 0 100 110" fill={accent}><path d="M50 2 L95 20 L95 55 C95 80 72 98 50 108 C28 98 5 80 5 55 L5 20 Z" /></svg>
                </div>
                <div
                  className="w-[96px] h-[96px] rounded-full flex items-center justify-center text-[40px] border-[2.5px] z-10 mb-3.5 animate-float"
                  style={{ background: `linear-gradient(135deg,${accent},#2A0A4A)`, borderColor: `${accent}66`, boxShadow: `0 0 32px ${accent}30` }}
                >
                  🤝
                </div>
                <div className="text-white text-[15px] font-medium text-center z-10 leading-[1.2]">{agent.fullName}</div>
                <div className="text-[11px] mt-1 text-center z-10" style={{ color: `${accent}BB` }}>{agent.agencyName || 'Representante independiente'}</div>
                <div className="mt-4 z-10 flex gap-2">
                  {agent.players > 0 && (
                    <div className="rounded-[10px] px-3 py-2 text-center" style={{ background: `${accent}15`, border: `0.5px solid ${accent}30` }}>
                      <div className="text-[22px] font-medium leading-none" style={{ color: accent }}>{agent.players}</div>
                      <div className="text-[rgba(255,255,255,0.2)] text-[8px] uppercase tracking-[0.06em] mt-0.5">Jugadores</div>
                    </div>
                  )}
                  {agent.countries > 0 && (
                    <div className="rounded-[10px] px-3 py-2 text-center" style={{ background: `${accent}15`, border: `0.5px solid ${accent}30` }}>
                      <div className="text-[22px] font-medium leading-none" style={{ color: accent }}>{agent.countries}</div>
                      <div className="text-[rgba(255,255,255,0.2)] text-[8px] uppercase tracking-[0.06em] mt-0.5">Países</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Right panel */}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge status={agent.status} />
                  <span className="text-[rgba(255,255,255,0.25)] text-[11px]">{agent.nationality}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    ['Jugadores', agent.players > 0 ? String(agent.players) : '—'],
                    ['Países', agent.countries > 0 ? String(agent.countries) : '—'],
                    ['Agencia', agent.agencyName || 'Independiente'],
                  ].map(([l,v]) => (
                    <div key={l} className="rounded-[9px] p-[10px_12px] text-center" style={{ background:`${accent}08`, border:`0.5px solid ${accent}20` }}>
                      <div className="text-[13px] font-medium leading-none truncate" style={{ color: accent }}>{v}</div>
                      <div className="text-[rgba(255,255,255,0.25)] text-[9px] mt-[3px] uppercase tracking-[0.05em]">{l}</div>
                    </div>
                  ))}
                </div>
                {agent.markets && agent.markets.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.07em] mb-2">Mercados</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {agent.markets.map(m => (
                        <span key={m} className="text-[10px] px-[11px] py-1 rounded-[20px]" style={{ background:`${accent}10`, border:`0.5px solid ${accent}30`, color:accent }}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                {agent.career && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                    <span className="text-[rgba(255,255,255,0.5)] text-[12px]">{agent.career}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two-col */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 280px' }}>
            <div className="flex flex-col gap-3.5">
              {agent.bio && (
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-[18px_20px]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2.5">Sobre el representante</div>
                  <p className="text-[rgba(255,255,255,0.5)] text-[12px] leading-[1.8]">{agent.bio}</p>
                </div>
              )}
              {agent.notableTransfers && agent.notableTransfers.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-[18px_20px]">
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2.5">Transfers destacados</div>
                  <div className="flex flex-col gap-1.5">
                    {agent.notableTransfers.map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: i === 0 ? accent : 'rgba(255,255,255,0.15)' }} />
                        <span className="text-[rgba(255,255,255,0.5)] text-[12px]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4">
                <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2">Agencia</div>
                <div className="text-white text-[14px] font-medium">{agent.agencyName || 'Independiente'}</div>
                <div className="text-[rgba(255,255,255,0.3)] text-[11px] mt-1">{agent.nationality}</div>
              </div>
              <div className="rounded-[12px] p-4" style={{ background:`${accent}0A`, border:`0.5px solid ${accent}25` }}>
                <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.08em] mb-2">Contacto</div>
                <p className="text-[rgba(255,255,255,0.35)] text-[11px] leading-[1.6] mb-3">Para contactar a este representante, iniciá sesión o registrate.</p>
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => router.push('/auth?tab=register')}>Contactar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
