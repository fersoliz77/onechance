'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { isAdminRole } from '@/lib/permissions'
import { ROLE_ACCENT, ROLE_LABELS } from '@/lib/constants'
import { subscribeNotifications, markAllNotificationsRead, type NotificationEntry } from '@/lib/rtdb'
import type { Role } from '@/types'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function NotificationBell({ uid }: { uid: string }) {
  const [notifs, setNotifs] = useState<NotificationEntry[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => subscribeNotifications(uid, setNotifs), [uid])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifs.filter(n => !n.read).length

  function handleOpen() {
    setOpen(o => !o)
    if (unread > 0) markAllNotificationsRead(uid)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        className="relative flex items-center justify-center w-9 h-9 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
      >
        <svg className="h-[17px] w-[17px] text-white/55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-[3px] leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[300px] rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(14,14,14,0.97)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden z-[200]">
          <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">Notificaciones</span>
            {notifs.length > 0 && (
              <span className="text-[10px] text-[rgba(255,255,255,0.2)]">{notifs.length} total</span>
            )}
          </div>
          {notifs.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-[rgba(255,255,255,0.2)]">Sin notificaciones</div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              {notifs.slice(0, 10).map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 ${!n.read ? 'bg-[rgba(255,255,255,0.03)]' : ''}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00C853] shrink-0" />}
                    <div className={!n.read ? '' : 'pl-[14px]'}>
                      <p className="text-[12px] text-[rgba(255,255,255,0.65)] leading-[1.5]">{n.message}</p>
                      <p className="text-[10px] text-[rgba(255,255,255,0.2)] mt-0.5">{n.createdAt ? timeAgo(n.createdAt) : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const links = [
  { href: '/jugadores',      label: 'Jugadores' },
  { href: '/tecnicos',       label: 'Técnicos' },
  { href: '/clubes',         label: 'Clubes' },
  { href: '/representantes', label: 'Representantes' },
]

function UserMenu({ name, role, systemRole }: { name: string; role: Role | null; systemRole: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const accent = role ? ROLE_ACCENT[role] : 'var(--oc-role-player)'
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const roleLabel = role ? ROLE_LABELS[role] : 'Usuario'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-1.5 transition-all duration-200"
        style={{
          borderColor: open ? `${accent}55` : 'rgba(255,255,255,0.12)',
          background: open ? `${accent}10` : 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: `linear-gradient(135deg,${accent},${accent}55)` }}
        >
          <span className="text-black">{initial}</span>
        </div>
        <span className="text-white text-[12px] font-medium hidden sm:block max-w-[110px] truncate">{name}</span>
        <svg className="hidden h-3 w-3 shrink-0 text-white/40 sm:block" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d={open ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(14,14,14,0.97)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden z-[200]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)]">
            <div className="text-white text-[13px] font-medium truncate">{name}</div>
            <div className="text-[11px] mt-0.5 truncate" style={{ color: accent }}>{roleLabel}</div>
          </div>
          {/* Actions */}
          <div className="py-1.5">
            <button
              onClick={() => { setOpen(false); router.push('/dashboard') }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer text-left"
            >
              <span className="text-[14px]">◉</span> Mi panel
            </button>
            {isAdminRole(systemRole as 'user' | 'admin' | 'super_admin') && (
              <button
                onClick={() => { setOpen(false); router.push('/admin') }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer text-left"
              >
                <span className="text-[14px]">⚡</span> Panel admin
              </button>
            )}
            <div className="my-1 border-t border-[rgba(255,255,255,0.06)]" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-[rgba(255,60,60,0.75)] hover:text-[#FF6060] hover:bg-[rgba(255,60,60,0.06)] transition-colors cursor-pointer text-left"
            >
              <span className="text-[14px]">→</span> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
              <NotificationBell uid={user.uid} />
              <UserMenu name={user.name || user.email || ''} role={user.role} systemRole={user.systemRole} />
              <button
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--oc-border-hi)] text-white lg:hidden"
                onClick={() => setMobileOpen(prev => !prev)}
              >
                <span className="text-[16px] leading-none">{mobileOpen ? 'x' : '='}</span>
              </button>
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
                onClick={() => setMobileOpen(prev => !prev)}
              >
                <span className="text-[16px] leading-none">{mobileOpen ? 'x' : '='}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`border-t border-[var(--oc-border)] bg-[rgba(10,10,10,0.98)] px-5 py-4 lg:hidden ${mobileOpen ? 'block backdrop-blur-[14px]' : 'hidden'}`}>
        <div className="flex flex-col gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`oc-nav-link rounded-[8px] px-3 py-2 text-[14px] ${pathname.startsWith(l.href) ? 'is-active' : 'text-white'}`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <div className="my-2 border-t border-[rgba(255,255,255,0.06)]" />
              <button
                onClick={() => { setMobileOpen(false); router.push('/dashboard') }}
                className="rounded-[8px] px-3 py-2 text-[14px] text-white text-left cursor-pointer bg-transparent border-none"
              >
                Mi panel
              </button>
              <button
                onClick={async () => { setMobileOpen(false); await logout(); router.push('/') }}
                className="rounded-[8px] px-3 py-2 text-[14px] text-[rgba(255,60,60,0.8)] text-left cursor-pointer bg-transparent border-none"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
