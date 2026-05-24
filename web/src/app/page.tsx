import type { Metadata } from 'next'
import Script from 'next/script'
import LandingPage from '@/components/landing/LandingPage'

const SITE_URL = 'https://onechance.app'
const SITE_NAME = 'OneChance'
const TITLE = 'OneChance — Vidriera profesional de fútbol en Latinoamérica'
const DESCRIPTION =
  'La plataforma que conecta jugadores, clubes, técnicos y representantes de fútbol en Argentina, Uruguay, Brasil y toda Latinoamérica. Creá tu perfil profesional, mostrá tu talento y encontrá tu próxima oportunidad.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    languages: { 'es-AR': '/', 'es': '/' },
  },
  keywords: [
    'fútbol latinoamérica',
    'plataforma fútbol argentina',
    'jugadores de fútbol',
    'vidriera de fútbol',
    'scouting fútbol',
    'representantes de fútbol',
    'técnicos de fútbol',
    'clubes de fútbol',
    'oportunidades fútbol',
    'fútbol profesional',
    'OneChance fútbol',
    'talentos fútbol',
    'perfiles de jugadores',
    'fútbol Uruguay',
    'fútbol Brasil',
    'fútbol Colombia',
    'fútbol Chile',
  ],
  authors: [{ name: 'OneChance', url: SITE_URL }],
  creator: 'OneChance',
  publisher: 'OneChance',
  category: 'sports',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'OneChance — Plataforma profesional de fútbol en Latinoamérica',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/images/og-image.png`],
    creator: '@onechanceapp',
    site: '@onechanceapp',
  },
  verification: {
    google: 'PENDING',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: 'es-AR',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/jugadores?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/pwa-icon-512.svg`,
        width: 512,
        height: 512,
      },
      sameAs: [],
      description: DESCRIPTION,
      areaServed: [
        { '@type': 'Country', name: 'Argentina' },
        { '@type': 'Country', name: 'Uruguay' },
        { '@type': 'Country', name: 'Brasil' },
        { '@type': 'Country', name: 'Chile' },
        { '@type': 'Country', name: 'Colombia' },
        { '@type': 'Country', name: 'Paraguay' },
        { '@type': 'Country', name: 'México' },
        { '@type': 'Country', name: 'Perú' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: TITLE,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      description: DESCRIPTION,
      inLanguage: 'es-AR',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: SITE_URL,
          },
        ],
      },
    },
  ],
}

export default function Page() {
  return (
    <>
      <Script
        id="json-ld-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      <LandingPage />
    </>
  )
}
