import { useEffect, useMemo, useState } from 'react'
import { getPublishedAgents } from '@/lib/firestore'
import type { AgentProfile } from '@/types'

export interface AgentFilters {
  nationality: string
}

export const emptyAgentFilters: AgentFilters = { nationality: '' }

export function useAgentsListing() {
  const [agents, setAgents] = useState<AgentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AgentFilters>(emptyAgentFilters)

  useEffect(() => {
    getPublishedAgents().then(data => {
      setAgents(data)
      setLoading(false)
    })
  }, [])

  const visible = useMemo(() => {
    return agents.filter(a => {
      if (filters.nationality && a.nationality !== filters.nationality) return false
      if (
        search &&
        !a.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !(a.agencyName || '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [agents, filters, search])

  return { agents, visible, loading, search, setSearch, filters, setFilters }
}
