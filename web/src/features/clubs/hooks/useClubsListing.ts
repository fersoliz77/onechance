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
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ClubFilters>(emptyClubFilters)

  useEffect(() => {
    getPublishedClubs().then(data => {
      setClubs(data)
      setLoading(false)
    })
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

  return { clubs, visible, loading, search, setSearch, filters, setFilters }
}
