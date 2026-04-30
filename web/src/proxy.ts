import { NextRequest, NextResponse } from 'next/server'

// Auth token check handled client-side via AuthContext.
export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
