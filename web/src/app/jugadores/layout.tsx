import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jugadores de fútbol — Buscá talentos por posición, edad y país',
  description:
    'Explorá más de 1.000 jugadores y jugadoras de fútbol de Argentina, Uruguay, Brasil y toda Latinoamérica. Filtrá por posición, pie hábil, edad y nacionalidad.',
  keywords: [
    'jugadores de fútbol',
    'futbolistas latinoamérica',
    'scouting fútbol',
    'talentos fútbol argentina',
    'jugadoras fútbol',
    'delanteros argentina',
    'mediocampistas fútbol',
    'arqueros fútbol',
  ],
  openGraph: {
    title: 'Jugadores de fútbol — OneChance',
    description: 'Explorá el talento disponible en Latinoamérica. Más de 1.000 perfiles verificados.',
    type: 'website',
  },
  alternates: { canonical: '/jugadores' },
}

export default function JugadoresLayout({ children }: { children: React.ReactNode }) {
  return children
}
