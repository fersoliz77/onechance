import { ref, get, set, update, push, remove, onValue, off } from 'firebase/database'
import { rtdb } from './firebase'
import type { ProfileState, VideoEntry } from '@/types'

// ── PROFILE STATE ─────────────────────────────────────────────
export async function getProfileState(uid: string): Promise<ProfileState | null> {
  const snap = await get(ref(rtdb, `profiles/${uid}`))
  return snap.exists() ? (snap.val() as ProfileState) : null
}

export async function updateProfileState(uid: string, data: Partial<ProfileState>) {
  await update(ref(rtdb, `profiles/${uid}`), data)
}

export async function submitForReview(uid: string) {
  await update(ref(rtdb, `profiles/${uid}`), { status: 'pending' })
}

export async function updateVisibility(uid: string, visibility: Partial<ProfileState['visibility']>) {
  await update(ref(rtdb, `profiles/${uid}/visibility`), visibility)
}

// ── VIDEOS ────────────────────────────────────────────────────
export async function getVideos(uid: string): Promise<VideoEntry[]> {
  const snap = await get(ref(rtdb, `videos/${uid}`))
  if (!snap.exists()) return []
  const val = snap.val() as Record<string, Omit<VideoEntry, 'id'>>
  return Object.entries(val).map(([id, v]) => ({ id, ...v }))
}

export async function addVideo(uid: string, video: Omit<VideoEntry, 'id'>) {
  const newRef = push(ref(rtdb, `videos/${uid}`))
  await set(newRef, video)
  return newRef.key!
}

export async function removeVideo(uid: string, videoId: string) {
  await remove(ref(rtdb, `videos/${uid}/${videoId}`))
}

export async function toggleVideoStatus(uid: string, videoId: string, status: 'active' | 'hidden') {
  await update(ref(rtdb, `videos/${uid}/${videoId}`), { status })
}

// ── PHOTOS ────────────────────────────────────────────────────
export interface PhotoEntry {
  id: string
  url: string
  storagePath: string
  createdAt: string
}

export async function getPhotos(uid: string): Promise<PhotoEntry[]> {
  const snap = await get(ref(rtdb, `photos/${uid}`))
  if (!snap.exists()) return []
  const val = snap.val() as Record<string, Omit<PhotoEntry, 'id'>>
  return Object.entries(val).map(([id, p]) => ({ id, ...p }))
}

export async function addPhoto(uid: string, photo: Omit<PhotoEntry, 'id'>) {
  const newRef = push(ref(rtdb, `photos/${uid}`))
  await set(newRef, photo)
  return newRef.key!
}

export async function removePhoto(uid: string, photoId: string) {
  await remove(ref(rtdb, `photos/${uid}/${photoId}`))
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
export interface NotificationEntry {
  id: string
  type: 'profile_approved' | 'profile_rejected' | 'contact_received' | 'profile_viewed'
  message: string
  read: boolean
  createdAt: string
  fromName?: string
}

export async function getNotifications(uid: string): Promise<NotificationEntry[]> {
  const snap = await get(ref(rtdb, `notifications/${uid}`))
  if (!snap.exists()) return []
  const val = snap.val() as Record<string, Omit<NotificationEntry, 'id'>>
  return Object.entries(val)
    .map(([id, n]) => ({ id, ...n }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function subscribeNotifications(uid: string, cb: (notifs: NotificationEntry[]) => void) {
  const r = ref(rtdb, `notifications/${uid}`)
  const handler = (snap: { exists: () => boolean; val: () => unknown }) => {
    if (!snap.exists()) { cb([]); return }
    const val = snap.val() as Record<string, Omit<NotificationEntry, 'id'>>
    const list = Object.entries(val)
      .map(([id, n]) => ({ id, ...n }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    cb(list)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValue(r, handler as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => off(r, 'value', handler as any)
}

export async function markNotificationRead(uid: string, notifId: string) {
  await update(ref(rtdb, `notifications/${uid}/${notifId}`), { read: true })
}

export async function markAllNotificationsRead(uid: string) {
  const notifs = await getNotifications(uid)
  const updates: Record<string, boolean> = {}
  notifs.forEach(n => { updates[`notifications/${uid}/${n.id}/read`] = true })
  if (Object.keys(updates).length > 0) await update(ref(rtdb), updates)
}

export async function addNotification(uid: string, notif: Omit<NotificationEntry, 'id'>) {
  const newRef = push(ref(rtdb, `notifications/${uid}`))
  await set(newRef, notif)
  return newRef.key!
}

// ── MESSAGES ──────────────────────────────────────────────────
export interface MessageEntry {
  id: string
  fromUid: string
  fromName: string
  fromRole: string
  subject: string
  body: string
  read: boolean
  createdAt: string
}

export async function getMessages(uid: string): Promise<MessageEntry[]> {
  const snap = await get(ref(rtdb, `messages/${uid}`))
  if (!snap.exists()) return []
  const val = snap.val() as Record<string, Omit<MessageEntry, 'id'>>
  return Object.entries(val)
    .map(([id, m]) => ({ id, ...m }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function sendMessage(toUid: string, msg: Omit<MessageEntry, 'id'>) {
  const newRef = push(ref(rtdb, `messages/${toUid}`))
  await set(newRef, msg)
  return newRef.key!
}

export async function markMessageRead(uid: string, messageId: string) {
  await update(ref(rtdb, `messages/${uid}/${messageId}`), { read: true })
}

// ── FOLLOWS ───────────────────────────────────────────────────
export async function isFollowing(viewerUid: string, profileUid: string): Promise<boolean> {
  const snap = await get(ref(rtdb, `follows/${viewerUid}/${profileUid}`))
  return snap.exists()
}

export async function setFollow(viewerUid: string, profileUid: string, follow: boolean) {
  const r = ref(rtdb, `follows/${viewerUid}/${profileUid}`)
  if (follow) await set(r, { createdAt: new Date().toISOString() })
  else await remove(r)
}

// ── ADMIN: ALL VIDEOS ─────────────────────────────────────────
export async function getAllVideos(): Promise<(VideoEntry & { playerUid: string })[]> {
  const snap = await get(ref(rtdb, 'videos'))
  if (!snap.exists()) return []
  const result: (VideoEntry & { playerUid: string })[] = []
  const all = snap.val() as Record<string, Record<string, Omit<VideoEntry, 'id'>>>
  for (const [playerUid, videos] of Object.entries(all)) {
    for (const [id, v] of Object.entries(videos)) {
      result.push({ id, playerUid, ...v })
    }
  }
  return result
}

export async function adminRemoveVideo(playerUid: string, videoId: string) {
  await remove(ref(rtdb, `videos/${playerUid}/${videoId}`))
}

export async function adminToggleVideo(playerUid: string, videoId: string, status: 'active' | 'hidden') {
  await update(ref(rtdb, `videos/${playerUid}/${videoId}`), { status })
}

// ── PROFILE METRICS (REALTIME VISITS) ─────────────────────────
export function subscribeProfileVisits(uid: string, cb: (visits: number) => void) {
  const r = ref(rtdb, `profileMetrics/${uid}/visits`)
  const handler = (snap: { exists: () => boolean; val: () => unknown }) => {
    if (!snap.exists()) {
      cb(0)
      return
    }
    const val = snap.val()
    cb(typeof val === 'number' ? val : 0)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValue(r, handler as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => off(r, 'value', handler as any)
}

// ── USER CONVERSATION MIRROR (sender status, realtime) ───────
export interface UserConvMirror {
  id: string
  toUid: string
  toName: string
  toRole: string
  subject: string
  status: 'pending' | 'approved'
  messageCount: number
  updatedAt: string
  createdAt?: string
}

export function subscribeMessages(uid: string, cb: (msgs: MessageEntry[]) => void) {
  const r = ref(rtdb, `messages/${uid}`)
  const handler = (snap: { exists: () => boolean; val: () => unknown }) => {
    if (!snap.exists()) { cb([]); return }
    const val = snap.val() as Record<string, Omit<MessageEntry, 'id'>>
    cb(Object.entries(val).map(([id, m]) => ({ id, ...m })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValue(r, handler as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => off(r, 'value', handler as any)
}

export function subscribeUserConversations(uid: string, cb: (convs: UserConvMirror[]) => void) {
  const r = ref(rtdb, `userConversations/${uid}`)
  const handler = (snap: { exists: () => boolean; val: () => unknown }) => {
    if (!snap.exists()) { cb([]); return }
    const val = snap.val() as Record<string, Omit<UserConvMirror, 'id'>>
    cb(Object.entries(val).map(([id, c]) => ({ id, ...c })).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')))
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValue(r, handler as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => off(r, 'value', handler as any)
}

export function subscribeAdminInbox(cb: (count: number) => void) {
  const r = ref(rtdb, 'adminInbox')
  const handler = (snap: { exists: () => boolean; val: () => unknown }) => {
    cb(snap.exists() ? Object.keys(snap.val() as object).length : 0)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValue(r, handler as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => off(r, 'value', handler as any)
}

// ── ADMIN: RECENT ACTIVITY ────────────────────────────────────
export async function getRecentAuditActivity(limitCount = 5): Promise<{ id: string; action: string; actorEmail?: string; createdAt?: string }[]> {
  const snap = await get(ref(rtdb, 'audit_activity'))
  if (!snap.exists()) return []
  const val = snap.val() as Record<string, { action: string; actorEmail?: string; createdAt?: string }>
  return Object.entries(val)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, limitCount)
}
