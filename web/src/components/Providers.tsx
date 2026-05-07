'use client'
import { AuthProvider } from '@/context/AuthContext'
import Nav from '@/components/layout/Nav'
import Background from '@/components/layout/Background'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }, [])

  return (
    <AuthProvider>
      {!isLanding && !isAdmin && <Background />}
      {!isAdmin && <Nav />}
      {children}
    </AuthProvider>
  )
}
