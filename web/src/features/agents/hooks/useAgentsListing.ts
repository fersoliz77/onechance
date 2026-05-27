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
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AgentFilters>(emptyAgentFilters)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPublishedAgents()
      setAgents(data)
    } catch (err) {
      console.error('[useAgentsListing] getPublishedAgents failed:', err)
      setAgents([])
      setError('No se pudieron cargar los representantes. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(id)
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

  return { agents, visible, loading, error, reload: load, search, setSearch, filters, setFilters }
}
