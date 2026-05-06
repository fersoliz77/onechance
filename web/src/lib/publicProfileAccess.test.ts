import { describe, expect, it } from 'vitest'
import { canViewProfile } from '@/lib/publicProfileAccess'

describe('canViewProfile', () => {
  it('allows published profiles', () => {
    expect(canViewProfile({ profileStatus: 'published', profileUid: 'u1' })).toBe(true)
  })

  it('blocks non-published profiles for anonymous viewer', () => {
    expect(canViewProfile({ profileStatus: 'draft', profileUid: 'u1' })).toBe(false)
  })

  it('allows owner on non-published profiles', () => {
    expect(canViewProfile({ profileStatus: 'pending', profileUid: 'u1', viewerUid: 'u1' })).toBe(true)
  })
})
