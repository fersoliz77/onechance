import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AgentEditForm from '@/features/dashboard/components/forms/AgentEditForm'
import type { AgentProfile } from '@/types'

vi.mock('@/lib/firestore', () => ({
  updateAgent: vi.fn(),
}))

const agent: AgentProfile = {
  uid: 'a1',
  fullName: 'Agent One',
  nationality: 'Argentina',
  agencyName: 'Agency Pro',
  players: 10,
  countries: 3,
  markets: ['Argentina'],
  bio: 'Bio de agente',
  career: '10 anios',
  notableTransfers: [],
  status: 'draft',
}

describe('AgentEditForm', () => {
  it('renders main fields and save action', () => {
    render(<AgentEditForm agent={agent} uid="a1" onSaved={vi.fn()} />)
    expect(screen.getByDisplayValue('Agent One')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument()
  })
})
