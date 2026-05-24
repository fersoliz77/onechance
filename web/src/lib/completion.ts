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

export function getMissingFields(profile: Partial<PlayerProfile | CoachProfile | ClubProfile | AgentProfile>, role: string): string[] {
  const missing: string[] = []
  if (role === 'player') {
    const p = profile as Partial<PlayerProfile>
    if (!hasValue(p.bio)) missing.push('Descripción')
    if (!hasValue(p.career)) missing.push('Trayectoria')
    if (!hasValue(p.characteristics)) missing.push('Características')
    if (!hasValue(p.avatarUrl)) missing.push('Foto de perfil')
    if (!hasValue(p.languages)) missing.push('Idiomas')
    if (!hasValue(p.social?.instagram) && !hasValue(p.social?.tiktok) && !hasValue(p.social?.youtube)) missing.push('Redes sociales')
  } else if (role === 'coach') {
    const p = profile as Partial<CoachProfile>
    if (!hasValue(p.bio)) missing.push('Descripción')
    if (!hasValue(p.career)) missing.push('Trayectoria')
    if (!hasValue(p.skills)) missing.push('Habilidades')
    if (!hasValue(p.avatarUrl)) missing.push('Foto de perfil')
    if (!hasValue(p.trophies)) missing.push('Palmarés')
    if (!hasValue(p.languages)) missing.push('Idiomas')
  } else if (role === 'club') {
    const p = profile as Partial<ClubProfile>
    if (!hasValue(p.bio)) missing.push('Descripción')
    if (!hasValue(p.seeking)) missing.push('Búsqueda activa')
    if (!hasValue(p.achievements)) missing.push('Logros')
    if (!hasValue(p.imageUrl)) missing.push('Imagen del club')
    if (!hasValue(p.stadium)) missing.push('Estadio')
  } else if (role === 'agent') {
    const p = profile as Partial<AgentProfile>
    if (!hasValue(p.bio)) missing.push('Descripción')
    if (!hasValue(p.career)) missing.push('Trayectoria')
    if (!hasValue(p.markets)) missing.push('Mercados')
    if (!hasValue(p.notableTransfers)) missing.push('Transferencias destacadas')
    if (!hasValue(p.avatarUrl)) missing.push('Foto de perfil')
  }
  return missing
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
