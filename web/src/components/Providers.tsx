'use client'
import { AuthProvider } from '@/context/AuthContext'
import Nav from '@/components/layout/Nav'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Nav />
      {children}
    </AuthProvider>
  )
}
