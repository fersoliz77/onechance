import { useEffect, useMemo, useState } from 'react'
import { getPublishedPlayers } from '@/lib/firestore'
import type { PlayerProfile } from '@/types'

const SAVED_FILTERS_KEY = 'oc_players_saved_filters_v1'
const RECENT_SEARCHES_KEY = 'oc_players_recent_searches_v1'

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
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<PlayerFilters>(emptyPlayerFilters)
  const [savedFilters, setSavedFilters] = useState<PlayerFilters[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPublishedPlayers()
      setPlayers(data)
    } catch (err) {
      console.error('[usePlayersListing] getPublishedPlayers failed:', err)
      setPlayers([])
      setError('No se pudieron cargar los jugadores. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const rawFilters = window.localStorage.getItem(SAVED_FILTERS_KEY)
      if (rawFilters) {
        const parsed = JSON.parse(rawFilters) as PlayerFilters[]
        if (Array.isArray(parsed)) setSavedFilters(parsed.slice(0, 5))
      }
      const rawSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY)
      if (rawSearches) {
        const parsed = JSON.parse(rawSearches) as string[]
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 6))
      }
    } catch {
      setSavedFilters([])
      setRecentSearches([])
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters))
  }, [savedFilters])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

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

  const saveCurrentFilters = () => {
    if (Object.values(filters).every(v => !v)) return
    setSavedFilters(prev => {
      const next = [filters, ...prev.filter(f => JSON.stringify(f) !== JSON.stringify(filters))]
      return next.slice(0, 5)
    })
  }

  const applySavedFilters = (next: PlayerFilters) => {
    setFilters(next)
  }

  const removeSavedFilters = (index: number) => {
    setSavedFilters(prev => prev.filter((_, i) => i !== index))
  }

  const registerRecentSearch = (value: string) => {
    const normalized = value.trim()
    if (normalized.length < 2) return
    setRecentSearches(prev => {
      const dedup = prev.filter(s => s.toLowerCase() !== normalized.toLowerCase())
      return [normalized, ...dedup].slice(0, 6)
    })
  }

  const removeRecentSearch = (value: string) => {
    setRecentSearches(prev => prev.filter(s => s !== value))
  }

  return {
    players,
    visible,
    loading,
    error,
    reload: load,
    search,
    setSearch,
    filters,
    setFilters,
    savedFilters,
    saveCurrentFilters,
    applySavedFilters,
    removeSavedFilters,
    recentSearches,
    registerRecentSearch,
    removeRecentSearch,
  }
}
