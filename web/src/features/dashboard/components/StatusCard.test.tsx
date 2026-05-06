import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import StatusCard from '@/features/dashboard/components/StatusCard'
import type { PlayerProfile } from '@/types'

const player: PlayerProfile = {
  uid: 'u1',
  fullName: 'Test Player',
  birthDate: '2000-01-01',
  gender: 'M',
  nationality: 'Argentina',
  position: 'Delantero',
  strongFoot: 'Der',
  height: '1.80',
  weight: '75',
  ageRange: '23-30',
  bio: 'Bio larga de ejemplo para cumplir el minimo requerido.',
  career: [{ club: 'Club A', years: '2020-2023' }],
  characteristics: ['Velocidad'],
  isMinor: false,
  isFeatured: false,
  currentClub: 'Club A',
  status: 'draft',
  photos: 0,
  videos: 0,
  overall: 0,
}

describe('StatusCard', () => {
  it('renders status and submit action', () => {
    render(<StatusCard profile={player} state={null} role="player" onSubmit={vi.fn()} />)
    expect(screen.getByText('Estado del perfil')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar a revision/i })).toBeInTheDocument()
  })
})
