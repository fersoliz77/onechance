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
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CoachFilters>(emptyCoachFilters)

  useEffect(() => {
    getPublishedCoaches().then(data => {
      setCoaches(data)
      setLoading(false)
    })
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

  return { coaches, visible, loading, search, setSearch, filters, setFilters }
}
