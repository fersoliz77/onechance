import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Decodes the JWT payload without verifying the signature.
// Full signature verification happens server-side in API routes via firebase-admin.
// Here we check: token is a valid JWT shape, is not expired, and has the expected role.
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin     = pathname.startsWith('/admin')

  if (!isDashboard && !isAdmin) return NextResponse.next()

  const tokenCookie = request.cookies.get('oc_auth')?.value

  // No cookie at all → send to login
  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  const payload = parseJwtPayload(tokenCookie)

  // Malformed token (e.g. old cookie set to "1") → send to login
  if (!payload) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  // Expired token → send to login
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  if (Date.now() / 1000 > exp) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  // Admin routes require admin or super_admin role claim
  if (isAdmin) {
    const role = payload.role as string | undefined
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
