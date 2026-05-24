# Next.js 16 — Migración de `middleware.ts` a `proxy.ts`

> Documento creado el 2026-05-23 tras un error de build en Vercel.  
> Aplica a proyectos que usan Next.js 16+ con Turbopack.

---

## El error

```
Error: Both middleware file "./src/middleware.ts" and proxy file "./src/proxy.ts"
are detected. Please use "./src/proxy.ts" only.
Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

Aparece en el build de Vercel (o localmente con `next build`) cuando el proyecto tiene **ambos archivos al mismo tiempo**.

---

## Qué cambió en Next.js 16

En Next.js 15 y anteriores, la lógica de middleware de edge se ponía en `middleware.ts` con `export function middleware()`.

Next.js 16 **renombró el concepto** de middleware a *proxy* y cambió tanto el nombre del archivo como el nombre del export:

| | Next.js ≤ 15 | Next.js 16+ |
|---|---|---|
| Archivo | `src/middleware.ts` | `src/proxy.ts` |
| Export | `export function middleware()` | `export function proxy()` |
| Config | `export const config` | igual |
| Parámetro | `NextRequest` | igual |
| Return | `NextResponse` | igual |

El resto de la API (`NextRequest`, `NextResponse`, `config.matcher`) **no cambió**.

---

## Cómo migrar (3 pasos)

### 1. Creá `src/proxy.ts` con el mismo contenido

```ts
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // toda tu lógica que antes estaba en middleware()
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

### 2. Eliminá `src/middleware.ts`

```bash
rm src/middleware.ts
```

Si dejás los dos archivos, el build falla. No hay modo de convivencia.

### 3. Verificá que no rompiste nada

```bash
npx tsc --noEmit   # sin errores de tipos
next build         # build limpio
```

---

## El proxy de autenticación de este proyecto

`src/proxy.ts` protege `/dashboard` y `/admin` sin llamar a Firebase Admin en el edge (no es compatible). En cambio, decodifica el JWT localmente para hacer un chequeo rápido de forma y expiración, y valida el claim de rol para rutas de admin.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Sin cookie → login
  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  const payload = parseJwtPayload(tokenCookie)

  // Token malformado → login
  if (!payload) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  // Token expirado → login
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  if (Date.now() / 1000 > exp) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url))
  }

  // Admin requiere claim de rol
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
```

**Por qué no se verifica la firma del JWT acá:**  
El edge runtime no soporta las APIs criptográficas que usa `firebase-admin`. La verificación real de firma ocurre en cada API route (`/api/profiles`, `/api/admin/*`) donde sí corre Node.js completo. El proxy sólo evita el redirect visual para usuarios sin sesión.

---

## Preguntas frecuentes

**¿Puedo usar otro nombre de archivo?**  
No. Next.js 16 busca exactamente `proxy.ts` (o `proxy.js`) en la raíz de `src/` o del proyecto.

**¿Cambió algo más en Next.js 16?**  
Sí. Consultá [02_stack.md](02_stack.md) y el AGENTS.md en `web/` para las advertencias sobre breaking changes.

**¿El archivo AGENTS.md menciona esto?**  
Sí: "This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."
