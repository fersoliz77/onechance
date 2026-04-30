import { useEffect, useMemo, useState } from 'react'
import { getPublishedPlayers } from '@/lib/firestore'
import type { PlayerProfile } from '@/types'

export interface PlayerFilters {
  gender: string
  ageRange: string
  position: string
  nationality: string
  strongFoot: string
}

export const emptyPlayerFilters: PlayerFilters = {
  gender: '',
  ageRange: '',
  position: '',
  nationality: '',
  strongFoot: '',
}

export function usePlayersListing() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<PlayerFilters>(emptyPlayerFilters)

  useEffect(() => {
    getPublishedPlayers().then(data => {
      setPlayers(data)
      setLoading(false)
    })
  }, [])

  const visible = useMemo(() => {
    return players.filter(p => {
      if (filters.gender && p.gender !== filters.gender) return false
      if (filters.ageRange && p.ageRange !== filters.ageRange) return false
      if (filters.position && p.position !== filters.position) return false
      if (filters.nationality && p.nationality !== filters.nationality) return false
      if (filters.strongFoot && p.strongFoot !== filters.strongFoot) return false
      if (
        search &&
        !p.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !p.position.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [players, filters, search])

  return { players, visible, loading, search, setSearch, filters, setFilters }
}
