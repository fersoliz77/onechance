export type Role = 'player' | 'coach' | 'club' | 'agent'
export type ProfileStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden'
export type Gender = 'M' | 'F'
export type AgeRange = '13-17' | '18-22' | '23-30'
export type StrongFoot = 'Der' | 'Izq' | 'Ambas'

export interface CareerEntry { club: string; years: string }
export interface CareerEntryWithRole { club: string; role: string; years: string }

export interface UserRecord {
  uid: string
  email: string
  role: Role
  name: string
  createdAt: string
}

export interface PlayerProfile {
  uid: string
  fullName: string
  birthDate: string
  gender: Gender
  nationality: string
  position: string
  strongFoot: StrongFoot
  height: string
  weight: string
  ageRange: AgeRange
  bio: string
  career: CareerEntry[]
  characteristics: string[]
  isMinor: boolean
  isFeatured: boolean
  currentClub: string
  status: ProfileStatus
  photos: number
  videos: number
  overall: number
}

export interface CoachProfile {
  uid: string
  fullName: string
  nationality: string
  age: number
  currentClub: string
  years: number
  skills: string[]
  languages: string[]
  bio: string
  career: CareerEntryWithRole[]
  trophies: string[]
  status: ProfileStatus
}

export interface ClubProfile {
  uid: string
  name: string
  country: string
  city: string
  province: string
  division: string
  president: string
  currentDirector: string
  currentCoach: string
  founded: number
  seeking: string[]
  bio: string
  achievements: string[]
  status: ProfileStatus
}

export interface AgentProfile {
  uid: string
  fullName: string
  nationality: string
  agencyName: string
  players: number
  countries: number
  markets: string[]
  bio: string
  career: string
  notableTransfers: string[]
  status: ProfileStatus
}

export interface ProfileState {
  status: ProfileStatus
  currentClub: string
  completionPct: number
  visibility: {
    showContact: boolean
    featured: boolean
    notifications: boolean
  }
}

export interface VideoEntry {
  id: string
  type: 'embed' | 'upload'
  platform: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | null
  title: string
  url: string | null
  storageRef: string | null
  status: 'active' | 'hidden'
  createdAt: string
}

export const POSITIONS = [
  'Arquero','Defensa','Lateral derecho','Lateral izquierdo','Volante',
  'Mediocampista central','Extremo derecho','Extremo izquierdo',
  'Enganche','Delantero','Segundo delantero','Marcador central','Carrilero',
]

export const COUNTRIES = [
  'Argentina','Uruguay','Brasil','Chile','Colombia',
  'Paraguay','México','Perú','Ecuador','Bolivia','Venezuela',
]

export const STATUS_META: Record<ProfileStatus, { color: string; bg: string; border: string; label: string }> = {
  published: { color: '#00C853', bg: 'rgba(0,200,83,0.1)',   border: 'rgba(0,200,83,0.3)',   label: 'Publicado'  },
  pending:   { color: '#FFB400', bg: 'rgba(255,180,0,0.1)', border: 'rgba(255,180,0,0.3)', label: 'Pendiente'  },
  draft:     { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', label: 'Borrador' },
  rejected:  { color: '#FF3C3C', bg: 'rgba(255,60,60,0.1)',  border: 'rgba(255,60,60,0.3)',  label: 'Rechazado'  },
  hidden:    { color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', label: 'Oculto' },
}
