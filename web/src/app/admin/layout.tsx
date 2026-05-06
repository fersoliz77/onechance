import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel — OneChance',
  description: 'Panel de administración de OneChance.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
