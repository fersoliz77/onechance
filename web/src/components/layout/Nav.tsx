'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import Button from '@/components/ui/Button'

const links = [
  { href: '/jugadores',      label: 'Jugadores' },
  { href: '/tecnicos',       label: 'Técnicos' },
  { href: '/clubes',         label: 'Clubes' },
  { href: '/representantes', label: 'Representantes' },
]

export default function Nav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 h-14 border-b border-[rgba(255,255,255,0.06)] backdrop-blur-[20px] bg-[rgba(5,10,20,0.85)]">
      {/* Logo */}
      <Link href="/" className="flex items-baseline gap-0.5 cursor-pointer no-underline">
        <span className="text-white text-[16px] font-medium tracking-[-0.02em]">ONE</span>
        <span className="w-[4px] h-[4px] bg-oc-green rounded-full mx-[2px] mb-[1px] self-end animate-blink" />
        <span className="text-oc-green text-[16px] font-medium tracking-[-0.02em]">CHANCE</span>
      </Link>

      {/* Nav links */}
      <div className="flex gap-6">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[12px] transition-colors duration-200 no-underline ${
              pathname.startsWith(l.href)
                ? 'text-white font-medium'
                : 'text-[rgba(255,255,255,0.35)] hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Auth area */}
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            {user.email?.includes('admin') && (
              <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Mi perfil
            </Button>
            <Button variant="primary" size="sm" onClick={handleLogout}>
              Salir
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => router.push('/auth?tab=login')}>
              Ingresar
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/auth?tab=register')}>
              Publicar perfil
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
