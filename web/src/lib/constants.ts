import type { Role, ProfileStatus } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  player: 'Jugador',
  coach:  'Técnico',
  club:   'Club',
  agent:  'Representante',
}

export const ROLE_ICONS: Record<Role, string> = {
  player: '⚽',
  coach:  '📋',
  club:   '🏟️',
  agent:  '🤝',
}

export const ROLE_ACCENT: Record<Role, string> = {
  player: '#00C853',
  coach:  '#5A8FFF',
  club:   '#FFB400',
  agent:  '#B464FF',
}

export const ROLE_TONE: Record<Role, 'green' | 'blue' | 'yellow' | 'purple'> = {
  player: 'green',
  coach:  'blue',
  club:   'yellow',
  agent:  'purple',
}

export const ROLE_COLLECTION: Record<Role, string> = {
  player: 'players',
  coach:  'coaches',
  club:   'clubs',
  agent:  'agents',
}

export const ROLE_ROUTE: Record<Role, string> = {
  player: 'jugadores',
  coach:  'tecnicos',
  club:   'clubes',
  agent:  'representantes',
}

export const STATUS_LABEL: Record<ProfileStatus, string> = {
  draft:     'Borrador',
  pending:   'Pendiente',
  published: 'Publicado',
  rejected:  'Rechazado',
  hidden:    'Oculto',
}

export const STATUS_COLOR: Record<ProfileStatus, string> = {
  draft:     'rgba(255,255,255,0.4)',
  pending:   '#FFB400',
  published: '#00C853',
  rejected:  '#FF3C3C',
  hidden:    'rgba(255,255,255,0.25)',
}

export const STATUS_BG: Record<ProfileStatus, string> = {
  draft:     'rgba(255,255,255,0.05)',
  pending:   'rgba(255,180,0,0.1)',
  published: 'rgba(0,200,83,0.1)',
  rejected:  'rgba(255,60,60,0.1)',
  hidden:    'rgba(255,255,255,0.04)',
}

export const MIN_COMPLETION_TO_SUBMIT = 60
