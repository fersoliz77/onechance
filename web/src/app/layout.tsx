import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
})

const SITE_URL = 'https://onechance.app'

export const metadata: Metadata = {
  title: {
    template: '%s | OneChance',
    default: 'OneChance — Vidriera profesional de fútbol en Latinoamérica',
  },
  description:
    'La plataforma que conecta jugadores, clubes, técnicos y representantes de fútbol en Argentina, Uruguay, Brasil y toda Latinoamérica.',
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/pwa-icon-192.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/icons/pwa-icon-512.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/images/estadio.png', sizes: '180x180' }],
    shortcut: '/icons/pwa-icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OneChance',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" dir="ltr" className={dmSans.variable}>
      <head>
        {/* Preconnect a dominios externos críticos */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebaseapp.com" />
        <link rel="dns-prefetch" href="https://googleapis.com" />
      </head>
      <body className="min-h-screen bg-oc-bg text-white font-sans antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-[8px] focus:bg-[var(--oc-lime)] focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-[#132008]"
          >
            Saltar al contenido
          </a>
          {children}
        </Providers>
      </body>
    </html>
  )
}
