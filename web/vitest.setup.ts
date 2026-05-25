import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  rtdb: {},
  storage: {},
}))

vi.mock('@/lib/rtdb', () => ({
  updateProfileState: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/firestore', async () => {
  const actual = await vi.importActual<typeof import('@/lib/firestore')>('@/lib/firestore')
  return {
    ...actual,
    getPublishedPlayers: vi.fn().mockResolvedValue([]),
  }
})
