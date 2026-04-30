import { ref, get, set, update, push, remove } from 'firebase/database'
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
