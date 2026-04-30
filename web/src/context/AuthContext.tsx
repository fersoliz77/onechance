'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, auth, getUserRecord } from '@/lib/auth'
import type { User } from 'firebase/auth'
import type { Role } from '@/types'

interface AuthUser {
  uid: string
  email: string | null
  name: string
  role: Role | null
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
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          name: record?.name ?? '',
          role: record?.role ?? null,
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
