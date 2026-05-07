# Scripts del proyecto (explicados simple)

Este documento es una guia rapida para entender los scripts del repo sin lenguaje tecnico complejo.

## Donde estan los scripts

- App web: `web/package.json`
- Workflow automatico (CI): `.github/workflows/web-ci.yml`

## Scripts de la app web

### `node scripts/seed.mjs`

- Que hace: crea/actualiza usuarios de prueba y perfiles demo (jugadores, tecnicos, clubes, representantes).
- Tambien carga media demo:
  - Fotos y videos en Realtime Database (`/photos/{uid}`, `/videos/{uid}`).
  - Fallback de galeria en Firestore (`players/{uid}.photoGallery`) para UI publica.
- Cuando usarlo: despues de clonar el repo, al resetear entorno de pruebas o al mejorar datos mock.
- Resultado esperado: mensaje `Seed completed: 7`.

Requisitos minimos para ejecutarlo:

- `GOOGLE_APPLICATION_CREDENTIALS` apuntando al JSON de service account.
- `FIREBASE_DATABASE_URL` (o `NEXT_PUBLIC_FIREBASE_DATABASE_URL`).

Ejemplo (bash):

```bash
GOOGLE_APPLICATION_CREDENTIALS="C:/ruta/service-account.json" FIREBASE_DATABASE_URL="https://<tu-proyecto>-default-rtdb.firebaseio.com" node scripts/seed.mjs
```

Si falla con `Missing env vars`:

- Validar que las variables esten en la misma linea del comando (o exportadas en la sesion).
- Validar que la ruta del JSON exista y sea legible.
- Validar que la URL RTDB sea la del proyecto correcto.

Si la miniatura aparece pero el detalle del jugador no muestra fotos:

- Re-ejecutar seed para refrescar `photoGallery` en Firestore y `/photos` en RTDB.
- Verificar que el perfil tenga `status: published`.
- Hacer hard refresh del navegador para limpiar cache de cliente.

### `npm run dev`

- Que hace: levanta la app en modo desarrollo.
- Cuando usarlo: cuando estas programando y queres ver cambios en vivo.
- Resultado esperado: se abre el servidor local de Next.js.

### `npm run build`

- Que hace: genera la version de produccion de la app.
- Cuando usarlo: antes de desplegar o para validar que todo compila bien.
- Resultado esperado: build exitoso sin errores.

### `npm run start`

- Que hace: ejecuta la app ya construida en modo produccion.
- Cuando usarlo: para probar localmente como correria en un entorno real.
- Requisito: primero correr `npm run build`.

### `npm run lint`

- Que hace: revisa reglas de calidad y estilo del codigo (ESLint).
- Cuando usarlo: antes de subir cambios o abrir un PR.
- Resultado esperado: cero errores de lint.

### `npm run typecheck`

- Que hace: valida tipos de TypeScript sin compilar salida (`tsc --noEmit`).
- Cuando usarlo: antes de mergear, para evitar errores de tipos en runtime.
- Resultado esperado: cero errores de tipos.

## Workflow automatico (CI)

Archivo: `.github/workflows/web-ci.yml`

Este workflow corre automaticamente en cada `push` o `pull_request` cuando hay cambios en `web/**`.

Pasos que ejecuta:

1. Instala dependencias (`npm ci`)
2. Ejecuta lint (`npm run lint`)
3. Ejecuta typecheck (`npm run typecheck`)
4. Intenta build de produccion (`npm run build`)

Si alguno falla, GitHub marca el chequeo en rojo.

## Espacio para nuevos scripts

Cuando agreguemos scripts nuevos, documentarlos asi:

| Script | Que hace | Cuando usarlo | Riesgo si falla |
|---|---|---|---|
| `npm run <nombre>` | Explicacion simple | Ejemplo de uso real | Impacto claro |

Ejemplo:

| Script | Que hace | Cuando usarlo | Riesgo si falla |
|---|---|---|---|
| `npm run test` | Corre tests automaticos | Antes de mergear | Bugs pueden pasar a produccion |

## Regla del repo

Todo script nuevo en `package.json` debe venir con su explicacion en este archivo.
