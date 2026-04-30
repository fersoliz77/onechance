import {
  collection, doc, getDoc, getDocs, updateDoc, setDoc,
  query, where, serverTimestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, Role, ProfileStatus, UserRecord } from '@/types'

// ── PLAYERS ──────────────────────────────────────────────────
export async function getPublishedPlayers(): Promise<PlayerProfile[]> {
  const q = query(collection(db, 'players'), where('status', '==', 'published'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as PlayerProfile)
}

export async function getPlayer(uid: string): Promise<PlayerProfile | null> {
  const snap = await getDoc(doc(db, 'players', uid))
  return snap.exists() ? (snap.data() as PlayerProfile) : null
}

export async function updatePlayer(uid: string, data: Partial<PlayerProfile>) {
  await updateDoc(doc(db, 'players', uid), { ...data, updatedAt: serverTimestamp() })
}

export async function getAllPlayers(): Promise<PlayerProfile[]> {
  const snap = await getDocs(collection(db, 'players'))
  return snap.docs.map(d => d.data() as PlayerProfile)
}

// ── COACHES ───────────────────────────────────────────────────
export async function getPublishedCoaches(): Promise<CoachProfile[]> {
  const q = query(collection(db, 'coaches'), where('status', '==', 'published'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as CoachProfile)
}

export async function getCoach(uid: string): Promise<CoachProfile | null> {
  const snap = await getDoc(doc(db, 'coaches', uid))
  return snap.exists() ? (snap.data() as CoachProfile) : null
}

export async function updateCoach(uid: string, data: Partial<CoachProfile>) {
  await updateDoc(doc(db, 'coaches', uid), { ...data, updatedAt: serverTimestamp() })
}

export async function getAllCoaches(): Promise<CoachProfile[]> {
  const snap = await getDocs(collection(db, 'coaches'))
  return snap.docs.map(d => d.data() as CoachProfile)
}

// ── CLUBS ─────────────────────────────────────────────────────
export async function getPublishedClubs(): Promise<ClubProfile[]> {
  const q = query(collection(db, 'clubs'), where('status', '==', 'published'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as ClubProfile)
}

export async function getClub(uid: string): Promise<ClubProfile | null> {
  const snap = await getDoc(doc(db, 'clubs', uid))
  return snap.exists() ? (snap.data() as ClubProfile) : null
}

export async function getAllClubs(): Promise<ClubProfile[]> {
  const snap = await getDocs(collection(db, 'clubs'))
  return snap.docs.map(d => d.data() as ClubProfile)
}

export async function updateClub(uid: string, data: Partial<ClubProfile>) {
  await updateDoc(doc(db, 'clubs', uid), { ...data, updatedAt: serverTimestamp() })
}

// ── AGENTS ────────────────────────────────────────────────────
export async function getPublishedAgents(): Promise<AgentProfile[]> {
  const q = query(collection(db, 'agents'), where('status', '==', 'published'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as AgentProfile)
}

export async function getAgent(uid: string): Promise<AgentProfile | null> {
  const snap = await getDoc(doc(db, 'agents', uid))
  return snap.exists() ? (snap.data() as AgentProfile) : null
}

export async function getAllAgents(): Promise<AgentProfile[]> {
  const snap = await getDocs(collection(db, 'agents'))
  return snap.docs.map(d => d.data() as AgentProfile)
}

export async function updateAgent(uid: string, data: Partial<AgentProfile>) {
  await updateDoc(doc(db, 'agents', uid), { ...data, updatedAt: serverTimestamp() })
}

// ── ADMIN ─────────────────────────────────────────────────────
export async function getPendingProfiles() {
  const [players, coaches, clubs, agents] = await Promise.all([
    getDocs(query(collection(db, 'players'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'coaches'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'clubs'),   where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'agents'),  where('status', '==', 'pending'))),
  ])
  return [
    ...players.docs.map(d => ({ ...d.data(), _col: 'players' })),
    ...coaches.docs.map(d => ({ ...d.data(), _col: 'coaches' })),
    ...clubs.docs.map(d => ({ ...d.data(), _col: 'clubs' })),
    ...agents.docs.map(d => ({ ...d.data(), _col: 'agents' })),
  ] as (DocumentData & { _col: string })[]
}

export async function setProfileStatus(col: string, uid: string, status: string) {
  await updateDoc(doc(db, col, uid), { status })
}

export async function setFeatured(uid: string, isFeatured: boolean) {
  await updateDoc(doc(db, 'players', uid), { isFeatured })
}

export async function setOwnProfileStatus(role: Role, uid: string, status: ProfileStatus) {
  const map: Record<Role, string> = {
    player: 'players',
    coach: 'coaches',
    club: 'clubs',
    agent: 'agents',
  }
  await updateDoc(doc(db, map[role], uid), { status })
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => d.data() as UserRecord)
}

export async function logAdminAction(payload: {
  actorUid: string
  actorEmail?: string | null
  action: string
  targetCollection?: string
  targetUid?: string
  metadata?: Record<string, unknown>
}) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await setDoc(doc(db, 'admin_audit_meta', 'last'), { updatedAt: serverTimestamp() }, { merge: true })
  await setDoc(doc(db, 'admin_audit_logs', id), {
    ...payload,
    createdAt: serverTimestamp(),
  })
}
