import type { ProfileStatus, SystemRole } from '@/types'

export function canViewProfile(params: {
  profileStatus: ProfileStatus
  profileUid: string
  viewerUid?: string
  viewerSystemRole?: SystemRole
}) {
  const { profileStatus, profileUid, viewerUid, viewerSystemRole } = params
  if (profileStatus === 'published') return true
  if (viewerUid && viewerUid === profileUid) return true
  if (viewerSystemRole === 'admin' || viewerSystemRole === 'super_admin') return true
  return false
}
