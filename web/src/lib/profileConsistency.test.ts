import { describe, expect, it } from 'vitest'
import { PROFILE_FIELD_MATRIX, ProfileUpdateSchema, sanitizeProfileUpdate } from '@/lib/profileConsistency'

describe('profile consistency matrix', () => {
  it('has editable and public fields for every role', () => {
    for (const role of Object.keys(PROFILE_FIELD_MATRIX)) {
      const matrix = PROFILE_FIELD_MATRIX[role as keyof typeof PROFILE_FIELD_MATRIX]
      expect(matrix.editable.length).toBeGreaterThan(0)
      expect(matrix.public.length).toBeGreaterThan(0)
      expect(matrix.required.length).toBeGreaterThan(0)
    }
  })

  it('keeps required fields inside editable set', () => {
    for (const role of Object.keys(PROFILE_FIELD_MATRIX)) {
      const matrix = PROFILE_FIELD_MATRIX[role as keyof typeof PROFILE_FIELD_MATRIX]
      const editable = new Set(matrix.editable)
      for (const field of matrix.required) expect(editable.has(field)).toBe(true)
    }
  })
})

describe('profile update sanitization', () => {
  it('removes unknown keys and normalizes strings/arrays', () => {
    const sanitized = sanitizeProfileUpdate('coach', {
      fullName: '  Juan   Perez  ',
      skills: [' Liderazgo ', 'liderazgo', ' Tactica '],
      privateFlag: true,
    })

    expect(sanitized).toEqual({
      fullName: 'Juan Perez',
      skills: ['Liderazgo', 'Tactica'],
    })
  })

  it('accepts valid payload for each role schema', () => {
    const payloads = [
      { role: 'player', data: { fullName: 'Alex', strongFoot: 'Der' } },
      { role: 'coach', data: { fullName: 'Bruno', age: 40 } },
      { role: 'club', data: { name: 'Club Central', founded: 1990 } },
      { role: 'agent', data: { fullName: 'Diego', countries: 4 } },
    ] as const

    for (const payload of payloads) {
      const parsed = ProfileUpdateSchema.safeParse(payload)
      expect(parsed.success).toBe(true)
    }
  })
})
