import { useEffect, useMemo, useState } from 'react'
import { getPublishedCoaches } from '@/lib/firestore'
import type { CoachProfile } from '@/types'

export interface CoachFilters {
  nationality: string
  minYears: string
}

export const emptyCoachFilters: CoachFilters = { nationality: '', minYears: '' }

export function useCoachesListing() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CoachFilters>(emptyCoachFilters)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPublishedCoaches()
      setCoaches(data)
    } catch (err) {
      console.error('[useCoachesListing] getPublishedCoaches failed:', err)
      setCoaches([])
      setError('No se pudieron cargar los técnicos. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const visible = useMemo(() => {
    return coaches.filter(c => {
      if (filters.nationality && c.nationality !== filters.nationality) return false
      if (filters.minYears && (c.years || 0) < parseInt(filters.minYears, 10)) return false
      if (
        search &&
        !c.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !(c.currentClub || '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [coaches, filters, search])

  return { coaches, visible, loading, error, reload: load, search, setSearch, filters, setFilters }
}
