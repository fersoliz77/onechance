import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OneChance',
    short_name: 'OneChance',
    description: 'Vidriera profesional de futbol para jugadores, clubes, tecnicos y representantes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    lang: 'es',
    icons: [
      { src: '/next.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/globe.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
