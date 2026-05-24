import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clubes de fútbol — Instituciones que buscan talento en Latinoamérica',
  description:
    'Clubes de fútbol de Argentina, Uruguay, Brasil, Chile, Colombia y más. Descubrí qué posiciones buscan y contactalos directamente.',
  keywords: [
    'clubes de fútbol argentina',
    'clubes fútbol latinoamérica',
    'instituciones deportivas',
    'clubes buscan jugadores',
    'fútbol amateur argentina',
    'clubes primera división',
    'liga amateur fútbol',
  ],
  openGraph: {
    title: 'Clubes de fútbol — OneChance',
    description: 'Instituciones que buscan talento activamente en Argentina y Latinoamérica.',
    type: 'website',
  },
  alternates: { canonical: '/clubes' },
}

export default function ClubesLayout({ children }: { children: React.ReactNode }) {
  return children
}
