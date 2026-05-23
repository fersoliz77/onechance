import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has('oc_auth')

  // Protect dashboard and admin pages
  if (!isAuthenticated) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth?tab=login', request.url))
    }
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth?tab=login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
