'use client'
import { AuthProvider } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const Nav = dynamic(() => import('@/components/layout/Nav'), { ssr: false })

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
