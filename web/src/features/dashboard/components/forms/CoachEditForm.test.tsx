import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CoachEditForm from '@/features/dashboard/components/forms/CoachEditForm'
import type { CoachProfile } from '@/types'

vi.mock('@/lib/firestore', () => ({
  updateCoach: vi.fn(),
}))

const coach: CoachProfile = {
  uid: 'c1',
  fullName: 'Coach One',
  nationality: 'Argentina',
  age: 40,
  currentClub: 'Club A',
  years: 12,
  skills: ['Tactica'],
  languages: ['Espanol'],
  bio: 'Bio de coach',
  career: [],
  trophies: [],
  status: 'draft',
}

describe('CoachEditForm', () => {
  it('renders main fields and save action', () => {
    render(<CoachEditForm coach={coach} uid="c1" onSaved={vi.fn()} />)
    expect(screen.getByDisplayValue('Coach One')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument()
  })
})
