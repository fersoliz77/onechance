import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'OneChance — Vidriera profesional de fútbol',
  description: 'La plataforma donde clubes, representantes y técnicos descubren el talento que están buscando.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-screen bg-oc-bg text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
