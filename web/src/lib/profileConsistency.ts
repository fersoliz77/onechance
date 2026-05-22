import { z } from 'zod'
import type { Role } from '@/types'

const trimText = (value: unknown) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
const normStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return value
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of value) {
    const v = trimText(item)
    if (typeof v !== 'string' || !v) continue
    const key = v.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(v)
  }
  return out
}

const normalizeRecord = (data: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(data)) {
    if (typeof raw === 'string') normalized[key] = trimText(raw)
    else if (Array.isArray(raw)) normalized[key] = normStringArray(raw)
    else normalized[key] = raw
  }
  return normalized
}

const PlayerDataSchema = z.object({
  fullName: z.string().min(2).max(120),
  bio: z.string().max(1200),
  position: z.string().max(80),
  nationality: z.string().max(80),
  currentClub: z.string().max(120),
  height: z.string().max(16),
  weight: z.string().max(16),
  strongFoot: z.enum(['Der', 'Izq', 'Ambas']),
  characteristics: z.array(z.string().min(1).max(60)).max(30),
  languages: z.array(z.string().min(1).max(40)).max(10),
}).partial()

const CoachDataSchema = z.object({
  fullName: z.string().min(2).max(120),
  bio: z.string().max(1200),
  nationality: z.string().max(80),
  currentClub: z.string().max(120),
  years: z.number().int().min(0).max(80),
  age: z.number().int().min(0).max(100),
  skills: z.array(z.string().min(1).max(60)).max(30),
  languages: z.array(z.string().min(1).max(40)).max(10),
  trophies: z.array(z.string().min(1).max(120)).max(50),
  career: z.array(z.object({ club: z.string().max(120), role: z.string().max(80), years: z.string().max(40) })).max(50),
}).partial()

const ClubDataSchema = z.object({
  name: z.string().min(2).max(120),
  country: z.string().max(80),
  city: z.string().max(80),
  province: z.string().max(80),
  division: z.string().max(80),
  president: z.string().max(120),
  currentDirector: z.string().max(120),
  currentCoach: z.string().max(120),
  founded: z.number().int().min(0).max(3000),
  bio: z.string().max(1200),
  seeking: z.array(z.string().min(1).max(60)).max(30),
  achievements: z.array(z.string().min(1).max(120)).max(50),
}).partial()

const AgentDataSchema = z.object({
  fullName: z.string().min(2).max(120),
  nationality: z.string().max(80),
  agencyName: z.string().max(120),
  players: z.number().int().min(0).max(100000),
  countries: z.number().int().min(0).max(300),
  bio: z.string().max(1200),
  career: z.string().max(300),
  markets: z.array(z.string().min(1).max(80)).max(60),
  notableTransfers: z.array(z.string().min(1).max(120)).max(80),
}).partial()

export const ProfileUpdateSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('player'), data: PlayerDataSchema }),
  z.object({ role: z.literal('coach'), data: CoachDataSchema }),
  z.object({ role: z.literal('club'), data: ClubDataSchema }),
  z.object({ role: z.literal('agent'), data: AgentDataSchema }),
])

export const PROFILE_FIELD_MATRIX: Record<Role, { editable: string[]; required: string[]; public: string[] }> = {
  player: {
    editable: ['fullName', 'bio', 'position', 'nationality', 'currentClub', 'height', 'weight', 'strongFoot', 'characteristics', 'languages'],
    required: ['fullName', 'position', 'nationality', 'bio'],
    public: ['fullName', 'bio', 'position', 'nationality', 'currentClub', 'height', 'weight', 'strongFoot', 'characteristics', 'languages', 'career', 'avatarUrl', 'photoGallery'],
  },
  coach: {
    editable: ['fullName', 'bio', 'nationality', 'currentClub', 'years', 'age', 'skills', 'languages', 'trophies', 'career'],
    required: ['fullName', 'nationality', 'bio'],
    public: ['fullName', 'bio', 'nationality', 'currentClub', 'years', 'age', 'skills', 'languages', 'trophies', 'career', 'avatarUrl'],
  },
  club: {
    editable: ['name', 'country', 'city', 'province', 'division', 'president', 'currentDirector', 'currentCoach', 'founded', 'bio', 'seeking', 'achievements'],
    required: ['name', 'country', 'city', 'bio'],
    public: ['name', 'country', 'city', 'province', 'division', 'president', 'currentDirector', 'currentCoach', 'founded', 'bio', 'seeking', 'achievements', 'imageUrl'],
  },
  agent: {
    editable: ['fullName', 'nationality', 'agencyName', 'players', 'countries', 'bio', 'career', 'markets', 'notableTransfers'],
    required: ['fullName', 'nationality', 'bio'],
    public: ['fullName', 'nationality', 'agencyName', 'players', 'countries', 'bio', 'career', 'markets', 'notableTransfers', 'avatarUrl'],
  },
}

export function sanitizeProfileUpdate(role: Role, data: Record<string, unknown>) {
  const editable = new Set(PROFILE_FIELD_MATRIX[role].editable)
  const stripped = Object.fromEntries(Object.entries(data).filter(([key]) => editable.has(key)))
  return normalizeRecord(stripped)
}
