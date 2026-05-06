'use client'
import { AuthProvider } from '@/context/AuthContext'
import Nav from '@/components/layout/Nav'
import Background from '@/components/layout/Background'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <AuthProvider>
      {!isLanding && !isAdmin && <Background />}
      {!isAdmin && <Nav />}
      {children}
    </AuthProvider>
  )
}
