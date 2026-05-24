import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Técnicos de fútbol — Encontrá entrenadores y cuerpos técnicos',
  description:
    'Perfiles de técnicos y entrenadores de fútbol disponibles en Argentina, Uruguay, Brasil y Latinoamérica. Filtrá por experiencia, idioma y categoría.',
  keywords: [
    'técnicos de fútbol',
    'entrenadores fútbol argentina',
    'cuerpo técnico fútbol',
    'directors técnicos',
    'entrenadores latinoamérica',
    'técnicos primera división',
  ],
  openGraph: {
    title: 'Técnicos de fútbol — OneChance',
    description: 'Encontrá entrenadores y técnicos disponibles en toda Latinoamérica.',
    type: 'website',
  },
  alternates: { canonical: '/tecnicos' },
}

export default function TecnicosLayout({ children }: { children: React.ReactNode }) {
  return children
}
