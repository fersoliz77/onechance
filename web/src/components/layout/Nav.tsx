'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import Button from '@/components/ui/Button'
import { isAdminRole } from '@/lib/permissions'

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
    <nav className="fixed top-0 left-0 right-0 z-[100] h-[var(--oc-nav-height)] border-b border-[rgba(255,255,255,0.06)] backdrop-blur-[20px] bg-[rgba(5,10,20,0.9)]">
      <div className="oc-shell h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 cursor-pointer no-underline">
          <span className="text-white text-[16px] font-medium tracking-[-0.02em]">ONE</span>
          <span className="w-[4px] h-[4px] bg-oc-green rounded-full mx-[2px] animate-blink" />
          <span className="text-oc-green text-[16px] font-medium tracking-[-0.02em]">CHANCE</span>
        </Link>

        {/* Nav links */}
        <div className="hidden lg:flex gap-7">
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
        <div className="flex gap-1.5 sm:gap-2 items-center">
          {user ? (
            <>
              {isAdminRole(user.systemRole) && (
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
              <button
                onClick={() => router.push('/auth?tab=register')}
                className="h-[34px] px-4 rounded-[10px] inline-flex items-center gap-2 no-underline text-[12px] font-medium tracking-[-0.01em] text-[#032113] border border-[rgba(145,255,194,0.55)] bg-[linear-gradient(135deg,#18f17a_0%,#00c853_52%,#00b54b_100%)] shadow-[0_8px_14px_rgba(0,200,83,0.2),inset_0_1px_0_rgba(255,255,255,0.42)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(0,200,83,0.26)] cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#08301A]" />
                Publicar perfil
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
