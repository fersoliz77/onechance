import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlayerEditForm from '@/features/dashboard/components/forms/PlayerEditForm'
import type { PlayerProfile } from '@/types'

vi.mock('@/lib/firestore', () => ({
  updatePlayer: vi.fn(),
}))

const player: PlayerProfile = {
  uid: 'u1',
  fullName: 'Player One',
  birthDate: '2003-05-02',
  gender: 'M',
  nationality: 'Argentina',
  position: 'Delantero',
  strongFoot: 'Der',
  height: '1.78',
  weight: '72',
  ageRange: '23-30',
  bio: 'Bio de prueba para formulario',
  career: [],
  characteristics: ['Velocidad'],
  isMinor: false,
  isFeatured: false,
  currentClub: 'Club A',
  status: 'draft',
  photos: 0,
  videos: 0,
  overall: 0,
}

describe('PlayerEditForm', () => {
  it('renders primary fields and save button', () => {
    render(<PlayerEditForm player={player} uid="u1" onSaved={vi.fn()} />)
    expect(screen.getByDisplayValue('Player One')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument()
  })
})
