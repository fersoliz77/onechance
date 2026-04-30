/*
  Seed base for OneChance.
  Requires: firebase-admin credentials via GOOGLE_APPLICATION_CREDENTIALS.
*/

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import fs from 'node:fs'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const databaseURL = process.env.FIREBASE_DATABASE_URL

if (!serviceAccountPath || !databaseURL) {
  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_DATABASE_URL')
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL,
  })
}

const auth = getAuth()
const db = getFirestore()
const rtdb = getDatabase()

const accounts = [
  { email: 'superadmin@onechance.test', password: 'OneChance123!', systemRole: 'super_admin', accountRole: 'agent', name: 'Super Admin OneChance' },
  { email: 'admin.moderacion@onechance.test', password: 'OneChance123!', systemRole: 'admin', accountRole: 'coach', name: 'Admin Moderacion' },
  { email: 'admin.contenido@onechance.test', password: 'OneChance123!', systemRole: 'admin', accountRole: 'club', name: 'Admin Contenido' },
  { email: 'player.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'player', name: 'Jugador Demo' },
  { email: 'coach.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'coach', name: 'Tecnico Demo' },
  { email: 'club.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'club', name: 'Club Demo' },
  { email: 'agent.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'agent', name: 'Representante Demo' },
]

const samplePlayers = [
  { uid: 'seed_player_1', fullName: 'Lucas Ferreira', nationality: 'Argentina', position: 'Enganche', ageRange: '18-22', strongFoot: 'Der' },
  { uid: 'seed_player_2', fullName: 'Camila Rojas', nationality: 'Uruguay', position: 'Mediocampista central', ageRange: '18-22', strongFoot: 'Izq' },
  { uid: 'seed_player_3', fullName: 'Rodrigo Paredes', nationality: 'Colombia', position: 'Delantero', ageRange: '23-30', strongFoot: 'Der' },
  { uid: 'seed_player_4', fullName: 'Valentina Suárez', nationality: 'Chile', position: 'Lateral izquierdo', ageRange: '18-22', strongFoot: 'Izq' },
  { uid: 'seed_player_5', fullName: 'Diego Morales', nationality: 'Brasil', position: 'Arquero', ageRange: '23-30', strongFoot: 'Der' },
]

const sampleCoaches = [
  { uid: 'seed_coach_1', fullName: 'Martín Álvarez', nationality: 'Uruguay', years: 12 },
  { uid: 'seed_coach_2', fullName: 'Gustavo Herrera', nationality: 'Argentina', years: 15 },
  { uid: 'seed_coach_3', fullName: 'Paula Gómez', nationality: 'Chile', years: 9 },
  { uid: 'seed_coach_4', fullName: 'Renato Silva', nationality: 'Brasil', years: 11 },
  { uid: 'seed_coach_5', fullName: 'Andrés León', nationality: 'Colombia', years: 8 },
]

const sampleClubs = [
  { uid: 'seed_club_1', name: 'Club Deportivo Norte', country: 'Argentina', city: 'Rosario' },
  { uid: 'seed_club_2', name: 'Atlético Capital', country: 'Uruguay', city: 'Montevideo' },
  { uid: 'seed_club_3', name: 'Unión Pacífico', country: 'Chile', city: 'Valparaíso' },
  { uid: 'seed_club_4', name: 'Real Andino', country: 'Colombia', city: 'Medellín' },
  { uid: 'seed_club_5', name: 'Esporte Litoral', country: 'Brasil', city: 'Santos' },
]

const sampleAgents = [
  { uid: 'seed_agent_1', fullName: 'Carlos Vega', nationality: 'Argentina', agencyName: 'Vega Sports' },
  { uid: 'seed_agent_2', fullName: 'María Costa', nationality: 'Uruguay', agencyName: 'Costa Talent' },
  { uid: 'seed_agent_3', fullName: 'Felipe Mena', nationality: 'Chile', agencyName: 'Mena Football' },
  { uid: 'seed_agent_4', fullName: 'Juliana Prado', nationality: 'Brasil', agencyName: 'Prado Agency' },
  { uid: 'seed_agent_5', fullName: 'Iván Torres', nationality: 'Colombia', agencyName: 'Torres Global' },
]

async function upsertUserAccount(item) {
  let user
  try {
    user = await auth.getUserByEmail(item.email)
  } catch {
    user = await auth.createUser({ email: item.email, password: item.password, displayName: item.name })
  }

  await auth.setCustomUserClaims(user.uid, { role: item.systemRole })

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: item.email,
    name: item.name,
    role: item.accountRole,
    systemRole: item.systemRole,
    permissions: [],
    isActive: true,
    seedVersion: 'v1',
    createdBySeed: true,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  await rtdb.ref(`profiles/${user.uid}`).update({
    status: 'published',
    currentClub: '',
    completionPct: 80,
    visibility: { showContact: false, featured: false, notifications: true },
    seedVersion: 'v1',
  })

  return user.uid
}

async function main() {
  const report = []
  for (const account of accounts) {
    const uid = await upsertUserAccount(account)
    report.push({ uid, email: account.email, systemRole: account.systemRole, accountRole: account.accountRole })
  }

  for (const p of samplePlayers) {
    await db.collection('players').doc(p.uid).set({
      uid: p.uid,
      fullName: p.fullName,
      birthDate: '2002-01-01',
      gender: 'M',
      nationality: p.nationality,
      position: p.position,
      strongFoot: p.strongFoot,
      height: '1.78',
      weight: '74',
      ageRange: p.ageRange,
      bio: 'Perfil de muestra para auditoría funcional.',
      career: [{ club: 'Club Formativo', years: '2018-2021' }],
      characteristics: ['Visión', 'Pase', 'Lectura táctica'],
      isMinor: false,
      isFeatured: false,
      currentClub: 'Libre',
      status: 'published',
      photos: 0,
      videos: 1,
      overall: 80,
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  for (const c of sampleCoaches) {
    await db.collection('coaches').doc(c.uid).set({
      uid: c.uid,
      fullName: c.fullName,
      nationality: c.nationality,
      age: 40,
      currentClub: '',
      years: c.years,
      skills: ['4-3-3', 'Desarrollo juvenil'],
      languages: ['Español'],
      bio: 'Perfil técnico de muestra.',
      career: [{ club: 'Equipo Regional', role: 'DT', years: '2019-2024' }],
      trophies: [],
      status: 'published',
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  for (const c of sampleClubs) {
    await db.collection('clubs').doc(c.uid).set({
      uid: c.uid,
      name: c.name,
      country: c.country,
      city: c.city,
      province: '',
      division: 'Primera División',
      president: '',
      currentDirector: '',
      currentCoach: '',
      founded: 1980,
      seeking: ['Delantero'],
      bio: 'Club de muestra para pruebas integrales.',
      achievements: [],
      status: 'published',
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  for (const a of sampleAgents) {
    await db.collection('agents').doc(a.uid).set({
      uid: a.uid,
      fullName: a.fullName,
      nationality: a.nationality,
      agencyName: a.agencyName,
      players: 8,
      countries: 3,
      markets: ['Argentina', 'Chile'],
      bio: 'Representante de muestra.',
      career: 'Intermediación internacional',
      notableTransfers: [],
      status: 'published',
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  fs.writeFileSync('seed-report.json', JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2))
  console.log('Seed completed:', report.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
