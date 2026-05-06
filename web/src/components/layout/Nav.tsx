'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [navCompact, setNavCompact] = useState(false)

  useEffect(() => {
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setNavCompact(y > 72)

      if (y <= 24 || mobileOpen) {
        setNavHidden(false)
      } else {
        const delta = y - lastY
        if (delta > 8) setNavHidden(true)
        if (delta < -8) setNavHidden(false)
      }
      lastY = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobileOpen])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-[var(--oc-nav-height)] transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--oc-border)] bg-[rgba(10,10,10,0.76)] backdrop-blur-[14px]'
          : 'border-b border-transparent bg-transparent backdrop-blur-0'
      } ${navHidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="oc-shell h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 cursor-pointer no-underline">
          <span className={`text-white font-medium tracking-[-0.02em] transition-all duration-300 ${navCompact ? 'text-[19px]' : 'text-[22px]'}`}>ONE</span>
          <span className={`bg-oc-green rounded-full mx-[2px] animate-blink transition-all duration-300 ${navCompact ? 'w-[5px] h-[5px]' : 'w-[6px] h-[6px]'}`} />
          <span className={`text-oc-green font-medium tracking-[-0.02em] transition-all duration-300 ${navCompact ? 'text-[19px]' : 'text-[22px]'}`}>CHANCE</span>
        </Link>

        {/* Nav links */}
        <div className={`hidden lg:flex transition-all duration-300 ${navCompact ? 'gap-5' : 'gap-7'}`}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
               className={`oc-nav-link transition-all duration-300 ${navCompact ? 'text-[15px]' : 'text-[16px]'} ${
                pathname.startsWith(l.href)
                  ? 'is-active font-semibold'
                  : 'text-[var(--oc-fg-muted)]'
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
              <Button variant="outline" size="sm" onClick={() => router.push('/auth?tab=login')} className="hidden sm:inline-flex !px-7">
                Ingresar
              </Button>
              <button
                onClick={() => router.push('/auth?tab=register')}
                className="h-10 min-w-[140px] px-7 rounded-[8px] inline-flex items-center justify-center gap-2.5 no-underline text-[13px] font-[700] leading-none tracking-[-0.01em] text-black bg-[var(--oc-lime)] shadow-[0_8px_32px_rgba(170,255,0,0.25)] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#C4FF40] cursor-pointer"
              >
                Publicar perfil
              </button>
              <button
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--oc-border-hi)] text-white lg:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                <span className="text-[16px] leading-none">{mobileOpen ? 'x' : '='}</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className={`border-t border-[var(--oc-border)] bg-[rgba(10,10,10,0.98)] px-5 py-4 lg:hidden ${mobileOpen ? 'block backdrop-blur-[14px]' : 'hidden'}`}>
        <div className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`oc-nav-link rounded-[8px] px-3 py-2 text-[14px] ${pathname.startsWith(l.href) ? 'is-active' : 'text-white'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
