import React from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  rotate?: number
  animClass?: string
  delay?: string
  className?: string
}

export function PlayerCard({
  name, position, country, age, height, overall, avatar = '⚽', rotate = 0, animClass = '', delay = '0s', className
}: CardProps & { name: string; position: string; country: string; age: string; height: string; overall: string; avatar?: string }) {
  return (
    <div className={twMerge(animClass, className)} style={{ animationDelay: delay }}>
      <div
        className="w-[250px] sm:w-[300px] xl:w-[320px] bg-gradient-to-br from-[#10321B] via-[#0A2314] to-[#07170D] p-4"
        style={{
          border: '0.5px solid rgba(88,255,165,0.32)',
          borderRadius: '16px 4px 16px 16px',
          clipPath: 'polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%)',
          transform: `rotate(${rotate}deg)`,
          boxShadow: '0 16px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,200,83,0.08) inset'
        }}
      >
        <div className="h-[2px] bg-gradient-to-r from-oc-green to-transparent -mt-4 -mx-4 mb-3" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-oc-green to-oc-green-deep flex items-center justify-center text-[18px] border-[1.5px] border-[rgba(0,200,83,0.4)] shadow-[0_0_18px_rgba(0,200,83,0.35)]">{avatar}</div>
          <div className="flex-1">
            <div className="text-white text-[12px] font-medium">{name}</div>
            <div className="text-oc-green text-[10px] mt-0.5">{position}</div>
          </div>
            <div className="bg-[rgba(0,200,83,0.12)] rounded-[7px] px-[8px] py-[5px] text-center border border-[rgba(0,200,83,0.2)]">
            <div className="text-oc-green text-[14px] font-medium leading-none">{overall}</div>
            <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5">OVR</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[[country, 'Nac.'], [height, 'Alt.'], [age, 'Edad']].map(([v, l]) => (
            <div key={l} className="bg-[rgba(0,200,83,0.08)] rounded-[6px] p-[6px] text-center border border-[rgba(0,200,83,0.12)]">
              <div className="text-oc-green text-[11px] font-medium">{v}</div>
              <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ClubChip({
  name, liga, rotate = 0, animClass = '', delay = '0s', className
}: CardProps & { name: string; liga: string }) {
  return (
    <div className={twMerge(animClass, className)} style={{ animationDelay: delay }}>
      <div 
        className="w-[210px] sm:w-[220px] bg-gradient-to-br from-[#182436] to-[#0F1A2A] p-3 text-left" 
        style={{
          border: '0.5px solid rgba(255,180,0,0.22)',
          borderRadius: '10px',
          transform: `rotate(${rotate}deg)`,
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div className="text-[rgba(255,180,0,0.72)] text-[8px] uppercase tracking-[0.08em] mb-1">Club verificado</div>
        <div className="text-white text-[12px] font-medium">{name}</div>
        <div className="text-[rgba(255,255,255,0.35)] text-[9px] mt-0.5">{liga}</div>
      </div>
    </div>
  )
}

export function CoachCard({
  name, role, tags, rotate = 0, animClass = '', delay = '0s', className
}: CardProps & { name: string; role: string; tags: string[] }) {
  return (
    <div className={twMerge(animClass, className)} style={{ animationDelay: delay }}>
      <div
        className="w-[230px] sm:w-[280px] xl:w-[300px] bg-gradient-to-br from-[#112948] to-[#0B1A2E] p-4"
        style={{
          border: '0.5px solid rgba(120,170,255,0.3)',
          borderRadius: '16px 4px 16px 16px',
          clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)',
          transform: `rotate(${rotate}deg)`,
          boxShadow: '0 16px 34px rgba(0,0,0,0.34), 0 0 0 1px rgba(90,143,255,0.1) inset'
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-oc-blue to-[#0B1A3A] flex items-center justify-center text-[14px] border border-[rgba(90,143,255,0.35)] shadow-[0_0_14px_rgba(90,143,255,0.32)]">📋</div>
          <div>
            <div className="text-white text-[11px] font-medium">{name}</div>
            <div className="text-oc-blue text-[9px] mt-0.5">{role}</div>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {tags.map(t => (
            <span key={t} className="bg-[rgba(90,143,255,0.07)] text-oc-blue text-[8px] px-[8px] py-[3px] rounded-[8px]" style={{ border: '0.5px solid rgba(90,143,255,0.18)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RepChip({
  name, players, countries, rotate = 0, animClass = '', delay = '0s', className
}: CardProps & { name: string; players: string; countries: string }) {
  return (
    <div className={twMerge(animClass, className)} style={{ animationDelay: delay }}>
      <div 
        className="w-[200px] sm:w-[220px] bg-gradient-to-br from-[#1A102A] to-[#120A1E] p-3" 
        style={{
          border: '0.5px solid rgba(199,132,255,0.3)',
          borderRadius: '10px',
          transform: `rotate(${rotate}deg)`,
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div className="text-[rgba(180,100,255,0.75)] text-[8px] uppercase tracking-[0.08em] mb-1">Representante</div>
        <div className="text-white text-[12px] font-medium">{name}</div>
        <div className="flex gap-1.5 mt-2">
          <div className="flex-1 bg-[rgba(180,100,255,0.08)] rounded-[6px] p-1.5 text-center">
            <div className="text-[#B464FF] text-[11px] font-medium">{players}</div>
            <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase">Jugadores</div>
          </div>
          <div className="flex-1 bg-[rgba(180,100,255,0.08)] rounded-[6px] p-1.5 text-center">
            <div className="text-[#B464FF] text-[11px] font-medium">{countries}</div>
            <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase">Países</div>
          </div>
        </div>
      </div>
    </div>
  )
}
