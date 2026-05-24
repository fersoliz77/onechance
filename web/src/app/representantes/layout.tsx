import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Representantes deportivos — Agentes de fútbol en Latinoamérica',
  description:
    'Encontrá representantes y agentes deportivos especializados en fútbol latinoamericano. Conexiones reales entre talentos y mercados internacionales.',
  keywords: [
    'representantes de fútbol',
    'agentes deportivos argentina',
    'agentes fútbol latinoamérica',
    'representantes jugadores fútbol',
    'agencias deportivas',
    'transferencias fútbol',
    'mercados de fútbol',
  ],
  openGraph: {
    title: 'Representantes de fútbol — OneChance',
    description: 'Agentes y representantes deportivos conectados con talentos latinoamericanos.',
    type: 'website',
  },
  alternates: { canonical: '/representantes' },
}

export default function RepresentantesLayout({ children }: { children: React.ReactNode }) {
  return children
}
