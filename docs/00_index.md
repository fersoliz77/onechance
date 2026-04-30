# OneChance — Documentación del proyecto

> Plataforma web de scouting profesional de fútbol para América Latina.
> Stack: Next.js + TypeScript + Tailwind + Firebase + Vercel

## Archivos

| Doc | Contenido |
|-----|-----------|
| [01_vision.md](01_vision.md) | Qué es el producto, objetivos, roles, tono |
| [02_stack.md](02_stack.md) | Decisiones de arquitectura y tecnología |
| [03_screens.md](03_screens.md) | Inventario completo de pantallas y mockups |
| [04_design_system.md](04_design_system.md) | Tokens de color, tipografía, componentes |
| [05_data_model.md](05_data_model.md) | Modelo de datos Firestore + Realtime DB |
| [06_features.md](06_features.md) | Lista de features y orden de implementación |

## Mockups de referencia

```
OneChance mockup basicos/
  colors_and_type.css          ← tokens CSS completos
  ui_kits/
    landing/
      index.html               ← landing completa
      Nav.jsx, Cards.jsx, etc.
    platform/
      index.html               ← app completa (hash router)
      Shared.jsx               ← átomos + mock data
      AuthScreen.jsx           ← login + registro 3 pasos
      PlayersScreen.jsx        ← listado + perfil jugador
      ProfileScreens.jsx       ← técnicos, clubes, representantes
      DashboardScreen.jsx      ← panel privado usuario
      AdminScreen.jsx          ← panel administrador
  preview/                     ← previews del design system
```

## Quick start cuando se arranque código

```bash
npx create-next-app@latest onechance --typescript --tailwind --app
cd onechance
npm install firebase
```

Variables de entorno necesarias:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```
