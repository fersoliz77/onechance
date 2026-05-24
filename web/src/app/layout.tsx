import type { Metadata, Viewport } from 'next'
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/pwa-icon-192.svg', type: 'image/svg+xml' },
      { url: '/icons/pwa-icon-512.svg', type: 'image/svg+xml' },
    ],
    apple: '/images/estadio.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OneChance',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-screen bg-oc-bg text-white font-sans antialiased">
        <Providers>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-[8px] focus:bg-[var(--oc-lime)] focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-[#132008]">Saltar al contenido</a>
          {children}
        </Providers>
      </body>
    </html>
  )
}
