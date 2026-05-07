# One Chance Web

Aplicacion web de scouting futbolistico construida con Next.js + Firebase.

## Scripts

- `npm run dev`: inicia entorno local.
- `npm run build`: genera build de produccion.
- `npm run start`: sirve build.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: chequeo TypeScript sin emitir.
- `npm run seed`: carga datos de prueba.

## Setup rapido de seed (demo)

Objetivo: cargar usuarios y perfiles demo completos (incluye fotos/videos) para validar UI realista.

1) Confirmar prerequisitos:

- Tener el JSON de service account de Firebase (en este repo se usa en raiz).
- Tener `NEXT_PUBLIC_FIREBASE_DATABASE_URL` en `web/.env.local`.

2) Ejecutar seed desde `web/`:

```bash
GOOGLE_APPLICATION_CREDENTIALS="C:/Users/pikachu/Downloads/OneChance/onechance-platform-firebase-adminsdk-fbsvc-7be594e495.json" FIREBASE_DATABASE_URL="https://onechance-platform-default-rtdb.firebaseio.com" node scripts/seed.mjs
```

3) Validar resultado:

- Debe imprimir `Seed completed: 7`.
- Revisar listados y detalle en:
  - `/jugadores`
  - `/tecnicos`
  - `/clubes`
  - `/representantes`

Notas:

- Si falla con `Missing env vars`, revisar ruta del JSON y URL de RTDB.
- Si en detalle de jugador no aparecen fotos, re-ejecutar seed y hacer hard refresh del navegador.

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
