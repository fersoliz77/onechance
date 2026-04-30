import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, rtdb } from './firebase'
import { ref, set } from 'firebase/database'
import type { Role, ProfileStatus } from '@/types'

export { onAuthStateChanged, auth }
export type { User }

export async function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  return firebaseSignOut(auth)
}

export async function createUserRecord(
  uid: string,
  email: string,
  name: string,
  role: Role,
) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    name,
    role,
    createdAt: serverTimestamp(),
  })
}

export async function createPlayerRecord(
  uid: string,
  data: {
    fullName: string
    birthDate: string
    nationality: string
    position: string
    isMinor: boolean
  },
) {
  const status: ProfileStatus = data.isMinor ? 'pending' : 'draft'

  await setDoc(doc(db, 'players', uid), {
    uid,
    fullName: data.fullName,
    birthDate: data.birthDate,
    gender: 'M',
    nationality: data.nationality,
    position: data.position || '',
    strongFoot: 'Der',
    height: '',
    weight: '',
    ageRange: data.isMinor ? '13-17' : '18-22',
    bio: '',
    career: [],
    characteristics: [],
    isMinor: data.isMinor,
    isFeatured: false,
    currentClub: '',
    status,
    photos: 0,
    videos: 0,
    overall: 0,
  })

  await set(ref(rtdb, `profiles/${uid}`), {
    status,
    currentClub: '',
    completionPct: 20,
    visibility: { showContact: false, featured: false, notifications: true },
  })
}

export async function createCoachRecord(uid: string, data: { fullName: string; birthDate: string; nationality: string }) {
  await setDoc(doc(db, 'coaches', uid), {
    uid,
    fullName: data.fullName,
    nationality: data.nationality,
    age: 0,
    currentClub: '',
    years: 0,
    skills: [],
    languages: ['Español'],
    bio: '',
    career: [],
    trophies: [],
    status: 'draft',
  })
  await set(ref(rtdb, `profiles/${uid}`), {
    status: 'draft',
    currentClub: '',
    completionPct: 15,
    visibility: { showContact: false, featured: false, notifications: true },
  })
}

export async function createClubRecord(uid: string, data: { fullName: string; nationality: string }) {
  await setDoc(doc(db, 'clubs', uid), {
    uid,
    name: data.fullName,
    country: data.nationality,
    city: '',
    province: '',
    division: '',
    president: '',
    currentDirector: '',
    currentCoach: '',
    founded: 0,
    seeking: [],
    bio: '',
    achievements: [],
    status: 'draft',
  })
  await set(ref(rtdb, `profiles/${uid}`), {
    status: 'draft',
    currentClub: '',
    completionPct: 15,
    visibility: { showContact: false, featured: false, notifications: true },
  })
}

export async function createAgentRecord(uid: string, data: { fullName: string; nationality: string }) {
  await setDoc(doc(db, 'agents', uid), {
    uid,
    fullName: data.fullName,
    nationality: data.nationality,
    agencyName: '',
    players: 0,
    countries: 0,
    markets: [],
    bio: '',
    career: '',
    notableTransfers: [],
    status: 'draft',
  })
  await set(ref(rtdb, `profiles/${uid}`), {
    status: 'draft',
    currentClub: '',
    completionPct: 15,
    visibility: { showContact: false, featured: false, notifications: true },
  })
}

export async function getUserRecord(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}
