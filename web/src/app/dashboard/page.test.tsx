import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardPage from '@/app/dashboard/page'

const { pushMock, submitForReviewMock, setOwnProfileStatusMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  submitForReviewMock: vi.fn().mockResolvedValue(undefined),
  setOwnProfileStatusMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    loading: false,
    user: {
      uid: 'u1',
      role: 'player',
      name: 'Test User',
      email: 'test@example.com',
    },
  }),
}))

vi.mock('@/features/dashboard/hooks/useDashboardProfile', () => ({
  useDashboardProfile: () => ({
    loadingProfile: false,
    profile: {
      uid: 'u1',
      status: 'draft',
      fullName: 'Test User',
      birthDate: '2000-01-01',
      gender: 'M',
      nationality: 'Argentina',
      position: 'Delantero',
      strongFoot: 'Der',
      height: '1.80',
      weight: '75',
      ageRange: '23-30',
      bio: 'Bio de prueba extensa',
      career: [{ club: 'A', years: '2020' }],
      characteristics: ['Velocidad'],
      isMinor: false,
      isFeatured: false,
      currentClub: 'A',
      photos: 0,
      videos: 0,
      overall: 0,
    },
    state: null,
    setProfile: vi.fn(),
    setState: vi.fn(),
  }),
}))

vi.mock('@/lib/rtdb', () => ({
  submitForReview: submitForReviewMock,
}))

vi.mock('@/lib/firestore', () => ({
  setOwnProfileStatus: setOwnProfileStatusMock,
}))

vi.mock('@/features/dashboard/components/StatusCard', () => ({
  default: ({ onSubmit }: { onSubmit: () => void }) => <button onClick={onSubmit}>submit-review</button>,
}))

vi.mock('@/features/dashboard/components/RoleEditForms', () => ({
  PlayerEditForm: () => <div>player-form</div>,
  CoachEditForm: () => <div>coach-form</div>,
  ClubEditForm: () => <div>club-form</div>,
  AgentEditForm: () => <div>agent-form</div>,
}))

vi.mock('@/features/dashboard/components/sections/VideosSection', () => ({
  default: () => <div>videos-section</div>,
}))

vi.mock('@/features/dashboard/components/sections/PhotosSection', () => ({
  default: () => <div>photos-section</div>,
}))

vi.mock('@/features/dashboard/components/sections/SettingsSection', () => ({
  default: () => <div>settings-section</div>,
}))

describe('DashboardPage', () => {
  it('switches tabs and renders expected section', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByText('Editar datos'))
    expect(screen.getByText('player-form')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Fotos'))
    expect(screen.getByText('photos-section')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Configuracion'))
    expect(screen.getByText('settings-section')).toBeInTheDocument()
  })

  it('submits review flow actions', async () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByText('submit-review'))
    await waitFor(() => {
      expect(submitForReviewMock).toHaveBeenCalledWith('u1')
      expect(setOwnProfileStatusMock).toHaveBeenCalledWith('player', 'u1', 'pending')
    })
  })
})
