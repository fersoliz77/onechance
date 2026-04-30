'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, auth, getUserRecord } from '@/lib/auth'
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        const record = await getUserRecord(fbUser.uid)
        const token = await fbUser.getIdTokenResult()
        const claimRole = token.claims.role
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
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return <Ctx.Provider value={{ user, firebaseUser, loading }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
