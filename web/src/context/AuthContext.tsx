'use client'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { onIdTokenChanged, auth, getUserRecord } from '@/lib/auth'
import type { User } from 'firebase/auth'
import type { Role, SystemRole } from '@/types'

interface AuthUser {
  uid: string
  email: string | null
  name: string
  role: Role | null
  systemRole: SystemRole
  permissions: string[]
}

interface AuthCtx {
  user: AuthUser | null
  firebaseUser: User | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, firebaseUser: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const prevUidRef = useRef<string | null>(null)

  useEffect(() => {
    // onIdTokenChanged fires on login, logout AND on every automatic token refresh (~1h)
    // This keeps the cookie always up-to-date with a valid, non-expired token
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        const idToken = await fbUser.getIdToken()
        document.cookie = `oc_auth=${idToken}; path=/; SameSite=Lax; max-age=3600`

        prevUidRef.current = fbUser.uid
        let record = await getUserRecord(fbUser.uid)
        if (!record) {
          for (let attempt = 0; attempt < 8 && !record; attempt += 1) {
            await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
            record = await getUserRecord(fbUser.uid)
          }
        }
        const token = await fbUser.getIdTokenResult()
        const claimRole = (token.claims as { role?: string }).role
        const systemRole = claimRole === 'super_admin' || claimRole === 'admin' ? claimRole : (record?.systemRole ?? 'user')
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          name: record?.name ?? '',
          role: record?.role ?? null,
          systemRole,
          permissions: Array.isArray(record?.permissions) ? record.permissions : [],
        })
      } else {
        prevUidRef.current = null
        document.cookie = 'oc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return <Ctx.Provider value={{ user, firebaseUser, loading }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
