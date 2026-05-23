import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile } from '@/types'

function hasValue(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return false
  if (typeof v === 'number') return v > 0
  if (Array.isArray(v)) return v.length > 0
  return true
}

export function calcPlayerCompletion(p: Partial<PlayerProfile>): number {
  const checks = [
    { weight: 10, ok: hasValue(p.fullName) },
    { weight: 10, ok: hasValue(p.birthDate) },
    { weight: 5,  ok: hasValue(p.nationality) },
    { weight: 10, ok: hasValue(p.position) },
    { weight: 15, ok: hasValue(p.bio) },
    { weight: 15, ok: hasValue(p.career) },
    { weight: 10, ok: hasValue(p.characteristics) },
    { weight: 15, ok: hasValue(p.avatarUrl) },
    { weight: 5,  ok: hasValue(p.currentClub) },
    { weight: 5,  ok: hasValue(p.languages) },
    { weight: 5,  ok: hasValue(p.social?.instagram) || hasValue(p.social?.tiktok) || hasValue(p.social?.youtube) },
  ]
  return Math.min(100, checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0))
}

export function calcCoachCompletion(p: Partial<CoachProfile>): number {
  const checks = [
    { weight: 10, ok: hasValue(p.fullName) },
    { weight: 5,  ok: hasValue(p.nationality) },
    { weight: 15, ok: hasValue(p.bio) },
    { weight: 20, ok: hasValue(p.career) },
    { weight: 10, ok: hasValue(p.skills) },
    { weight: 10, ok: hasValue(p.currentClub) },
    { weight: 5,  ok: hasValue(p.languages) },
    { weight: 15, ok: hasValue(p.avatarUrl) },
    { weight: 10, ok: hasValue(p.trophies) },
  ]
  return Math.min(100, checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0))
}

export function calcClubCompletion(p: Partial<ClubProfile>): number {
  const checks = [
    { weight: 10, ok: hasValue(p.name) },
    { weight: 5,  ok: hasValue(p.country) },
    { weight: 5,  ok: hasValue(p.city) },
    { weight: 10, ok: hasValue(p.division) },
    { weight: 20, ok: hasValue(p.bio) },
    { weight: 10, ok: hasValue(p.seeking) },
    { weight: 10, ok: hasValue(p.achievements) },
    { weight: 15, ok: hasValue(p.imageUrl) },
    { weight: 5,  ok: hasValue(p.founded) },
    { weight: 5,  ok: hasValue(p.president) },
    { weight: 5,  ok: hasValue(p.stadium) },
  ]
  return Math.min(100, checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0))
}

export function calcAgentCompletion(p: Partial<AgentProfile>): number {
  const checks = [
    { weight: 10, ok: hasValue(p.fullName) },
    { weight: 5,  ok: hasValue(p.nationality) },
    { weight: 15, ok: hasValue(p.agencyName) },
    { weight: 15, ok: hasValue(p.bio) },
    { weight: 15, ok: hasValue(p.career) },
    { weight: 10, ok: hasValue(p.markets) },
    { weight: 15, ok: hasValue(p.notableTransfers) },
    { weight: 15, ok: hasValue(p.avatarUrl) },
  ]
  return Math.min(100, checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0))
}
