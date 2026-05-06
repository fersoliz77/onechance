import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ClubEditForm from '@/features/dashboard/components/forms/ClubEditForm'
import type { ClubProfile } from '@/types'

vi.mock('@/lib/firestore', () => ({
  updateClub: vi.fn(),
}))

const club: ClubProfile = {
  uid: 'cl1',
  name: 'Club Uno',
  country: 'Argentina',
  city: 'Rosario',
  province: '',
  division: 'Primera Division',
  president: '',
  currentDirector: '',
  currentCoach: 'Coach One',
  founded: 1900,
  seeking: ['Delantero'],
  bio: 'Bio de club',
  achievements: [],
  status: 'draft',
}

describe('ClubEditForm', () => {
  it('renders main fields and save action', () => {
    render(<ClubEditForm club={club} uid="cl1" onSaved={vi.fn()} />)
    expect(screen.getByDisplayValue('Club Uno')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument()
  })
})
