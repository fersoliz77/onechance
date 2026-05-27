import { useEffect, useMemo, useState } from 'react'
import { getPublishedClubs } from '@/lib/firestore'
import type { ClubProfile } from '@/types'

export interface ClubFilters {
  country: string
  division: string
}

export const emptyClubFilters: ClubFilters = { country: '', division: '' }

export const DIVISIONS = [
  'Primera División',
  'Segunda División',
  'Tercera División',
  'Liga Amateur',
  'Juveniles',
  'Femenino',
]

export function useClubsListing() {
  const [clubs, setClubs] = useState<ClubProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ClubFilters>(emptyClubFilters)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPublishedClubs()
      setClubs(data)
    } catch (err) {
      console.error('[useClubsListing] getPublishedClubs failed:', err)
      setClubs([])
      setError('No se pudieron cargar los clubes. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const visible = useMemo(() => {
    return clubs.filter(c => {
      if (filters.country && c.country !== filters.country) return false
      if (filters.division && c.division !== filters.division) return false
      if (
        search &&
        !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !(c.city || '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [clubs, filters, search])

  return { clubs, visible, loading, error, reload: load, search, setSearch, filters, setFilters }
}
