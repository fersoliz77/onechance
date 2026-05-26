'use client'

import { useEffect, useState } from 'react'
import { getAgent, getClub, getCoach, getPlayer } from '@/lib/firestore'
import { getProfileState } from '@/lib/rtdb'
import type { ProfileState } from '@/types'
import type { AnyProfile } from '@/features/dashboard/types'

export function useDashboardProfile(uid?: string, role?: string | null) {
  const [profile, setProfile] = useState<AnyProfile | null>(null)
  const [state, setState] = useState<ProfileState | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!uid || !role) {
      Promise.resolve().then(() => setLoadingProfile(false))
      return
    }
    const fetchers: Record<string, () => Promise<AnyProfile | null>> = {
      player: () => getPlayer(uid),
      coach: () => getCoach(uid),
      club: () => getClub(uid),
      agent: () => getAgent(uid),
    }
    const fn = fetchers[role]
    if (!fn) {
      Promise.resolve().then(() => setLoadingProfile(false))
      return
    }
    let cancelled = false
    const load = async () => {
      let profileResult: AnyProfile | null = null
      let stateResult: ProfileState | null = null

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const [p, s] = await Promise.all([fn(), getProfileState(uid)])
        profileResult = p
        stateResult = s
        if (p) break
        await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
      }

      if (cancelled) return
      setProfile(profileResult)
      setState(stateResult)
      setLoadingProfile(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [uid, role])

  return { profile, setProfile, state, setState, loadingProfile }
}
