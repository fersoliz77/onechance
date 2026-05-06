import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, Role } from '@/types'

export interface CompletionResult {
  pct: number
  missing: string[]
}

type AnyProfile = PlayerProfile | CoachProfile | ClubProfile | AgentProfile

function pctFromFields(filled: number, total: number) {
  return Math.round((filled / total) * 100)
}

export function calcPlayerCompletion(p: PlayerProfile): CompletionResult {
  const checks: [boolean, string][] = [
    [!!p.fullName,      'Nombre completo'],
    [!!p.birthDate,     'Fecha de nacimiento'],
    [!!p.nationality,   'Nacionalidad'],
    [!!p.position,      'Puesto'],
    [!!p.strongFoot,    'Pie hábil'],
    [!!p.height,        'Altura'],
    [!!p.weight,        'Peso'],
    [!!p.currentClub,   'Club actual'],
    [!!p.bio && p.bio.length > 20, 'Bio (mínimo 20 caracteres)'],
    [p.career?.length > 0,         'Al menos una entrada de trayectoria'],
    [p.characteristics?.length > 0,'Al menos una característica'],
  ]
  const filled = checks.filter(([ok]) => ok).length
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label)
  return { pct: pctFromFields(filled, checks.length), missing }
}

export function calcCoachCompletion(c: CoachProfile): CompletionResult {
  const checks: [boolean, string][] = [
    [!!c.fullName,    'Nombre completo'],
    [!!c.nationality, 'Nacionalidad'],
    [!!c.currentClub, 'Club actual'],
    [c.years > 0,     'Años de experiencia'],
    [!!c.bio && c.bio.length > 20, 'Bio (mínimo 20 caracteres)'],
    [c.career?.length > 0, 'Al menos una entrada de trayectoria'],
    [c.skills?.length > 0, 'Al menos una habilidad'],
  ]
  const filled = checks.filter(([ok]) => ok).length
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label)
  return { pct: pctFromFields(filled, checks.length), missing }
}

export function calcClubCompletion(c: ClubProfile): CompletionResult {
  const checks: [boolean, string][] = [
    [!!c.name,         'Nombre del club'],
    [!!c.country,      'País'],
    [!!c.city,         'Ciudad'],
    [!!c.division,     'División'],
    [!!c.currentCoach, 'Director técnico'],
    [!!c.bio && c.bio.length > 20, 'Descripción institucional (mínimo 20 caracteres)'],
    [c.seeking?.length > 0, 'Posiciones buscadas'],
  ]
  const filled = checks.filter(([ok]) => ok).length
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label)
  return { pct: pctFromFields(filled, checks.length), missing }
}

export function calcAgentCompletion(a: AgentProfile): CompletionResult {
  const checks: [boolean, string][] = [
    [!!a.fullName,    'Nombre completo'],
    [!!a.nationality, 'Nacionalidad'],
    [!!a.agencyName,  'Nombre de agencia'],
    [a.players > 0,   'Número de jugadores representados'],
    [a.countries > 0, 'Número de países donde opera'],
    [!!a.bio && a.bio.length > 20, 'Bio (mínimo 20 caracteres)'],
    [a.markets?.length > 0, 'Al menos un mercado'],
  ]
  const filled = checks.filter(([ok]) => ok).length
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label)
  return { pct: pctFromFields(filled, checks.length), missing }
}

export function calcCompletion(profile: AnyProfile, role: Role): CompletionResult {
  switch (role) {
    case 'player': return calcPlayerCompletion(profile as PlayerProfile)
    case 'coach':  return calcCoachCompletion(profile as CoachProfile)
    case 'club':   return calcClubCompletion(profile as ClubProfile)
    case 'agent':  return calcAgentCompletion(profile as AgentProfile)
  }
}
