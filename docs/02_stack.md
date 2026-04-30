# OneChance — Stack tecnológico

Arquitectura híbrida adoptada según documento de proyecto v1.1 (Abril 2026).
Decisión clave: usar las capas gratuitas de Firebase sin vincular tarjeta.

## Stack principal

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Framework | **Next.js** (App Router) + React + TypeScript | SSR para SEO en perfiles públicos, RSC disponible |
| Estilos | **Tailwind CSS** | Desarrollo rápido, responsive, compatible con design tokens |
| Auth | **Firebase Auth** | Email/password. Base gratuita, fácil integración |
| Datos estáticos | **Firestore** | Nombre, DNI, posición, nacionalidad — filtros múltiples |
| Datos dinámicos | **Firebase Realtime Database** | Club actual, estado perfil, videos, fotos, configuraciones |
| Storage | **Cloudinary** (preferido) o Firebase Storage | Imágenes y videos propios subidos |
| Deploy | **Vercel** | CI/CD automático desde Git |

## Lógica de separación Firestore / Realtime DB

**Firestore** → datos que casi no cambian y se usan en filtros de búsqueda:
- nombre, fecha de nacimiento, DNI, nacionalidad, posición, pierna hábil

**Realtime Database** → datos que cambian con frecuencia:
- estado del perfil (`draft` / `pending` / `published` / `rejected` / `hidden`)
- club actual
- videos (links y uploads)
- fotos
- configuraciones de visibilidad

## Convenciones del proyecto

- **TypeScript estricto** desde el inicio
- **Server Components** por defecto, Client Components solo donde hay interactividad
- **Tailwind** con CSS variables del design system mapeadas como tokens custom
- Sin backend propio en V1 — todo Firebase
- Los perfiles públicos son **rutas SSR** (Next.js) para SEO
- El dashboard y admin son **Client Components** con React state
