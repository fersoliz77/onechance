export async function registerProfileVisit(profileUid: string, viewerUid?: string) {
  if (!profileUid) return
  if (viewerUid && viewerUid === profileUid) return
  if (typeof window === 'undefined') return

  const key = `oc_profile_visit:${profileUid}`
  if (window.sessionStorage.getItem(key) === '1') return

  try {
    const res = await fetch('/api/profile-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUid }),
    })
    if (res.ok) window.sessionStorage.setItem(key, '1')
  } catch {
    // no-op
  }
}
