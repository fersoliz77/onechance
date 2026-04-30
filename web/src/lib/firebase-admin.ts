import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON')
  return JSON.parse(raw)
}

function getDatabaseUrl() {
  const url = process.env.FIREBASE_DATABASE_URL
  if (!url) throw new Error('Missing FIREBASE_DATABASE_URL')
  return url
}

export function getAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(getServiceAccount()),
      databaseURL: getDatabaseUrl(),
    })
  }
  return getApps()[0]
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}

export function getAdminRtdb() {
  return getDatabase(getAdminApp())
}
