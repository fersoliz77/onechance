import type { SystemRole } from '@/types'

export function isAdminRole(role: SystemRole | null | undefined) {
  return role === 'admin' || role === 'super_admin'
}

export function isSuperAdminRole(role: SystemRole | null | undefined) {
  return role === 'super_admin'
}
