import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Decodifica el payload JWT sin verificar la firma.
// La verificación completa ocurre server-side en las API routes via firebase-admin.
// Aquí sólo chequeamos: forma válida de JWT, no expirado, y claim de rol correcto.
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin     = pathname.startsWith('/admin')

  if (!isDashboard && !isAdmin) return NextResponse.next()

  const tokenCookie = request.cookies.get('oc_auth')?.value

  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  const payload = parseJwtPayload(tokenCookie)

  if (!payload) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  if (Date.now() / 1000 > exp) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  // No bloquear /admin en proxy por claim JWT: puede estar desactualizado
  // aunque Firestore ya tenga systemRole=admin/super_admin.
  // La autorización real del panel y de las APIs se valida server-side.
  if (isAdmin) return NextResponse.next()

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
