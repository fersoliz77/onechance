# One Chance Web

Aplicacion web de scouting futbolistico construida con Next.js + Firebase.

## Scripts

- `npm run dev`: inicia entorno local.
- `npm run build`: genera build de produccion.
- `npm run start`: sirve build.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: chequeo TypeScript sin emitir.
- `npm run seed`: carga datos de prueba.

## Flujos por rol

- Registro en `/auth` con 3 pasos: credenciales, rol, datos iniciales.
- Roles: `player`, `coach`, `club`, `agent`.
- Cada rol tiene formulario de edicion propio en `/dashboard`.
- Listados publicos por rol:
  - `/jugadores`
  - `/tecnicos`
  - `/clubes`
  - `/representantes`
- Perfil publico por rol:
  - `/jugadores/[id]`
  - `/tecnicos/[id]`
  - `/clubes/[id]`
  - `/representantes/[id]`

## Reglas de visibilidad

- Un perfil publico solo es visible si `status === 'published'`.
- El dueno del perfil y admin/super admin pueden verlo en estado no publicado.
- El CTA de contacto respeta `profiles/{uid}/visibility.showContact`.

## Seguridad

- API de admin protegida por token y rol (`admin`/`super_admin`).
- Reglas Firestore en `firestore.rules`.
- Reglas RTDB en `database.rules.json`.

## Variables de entorno

Definir en `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
