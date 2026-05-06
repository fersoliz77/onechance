# Admin Dashboard — Plan de Mejoras
**Proyecto:** OneChance  
**Archivo base:** `web/src/app/admin/page.tsx`  
**Estado:** ✅ Completado  
**Última actualización:** 2025-05-06

---

## Resumen

Mejoras de punta a punta sobre el admin dashboard de OneChance.  
Organizadas en 4 fases: UX Core → Datos en tiempo real → Diseño premium → Seguridad/Producción.

---

## Fase 1 — UX Core 🎯

### [x] 1.1 Toast Notifications
**Archivos:** `components/admin/ui/ToastProvider.tsx`, `hooks/useToast.ts`  
**Descripción:** Sistema global de toasts para feedback en acciones de aprobar, rechazar, eliminar.  
**Tokens de diseño:** lime para éxito, rose para error, amber para advertencia.  
**API:**
```ts
const { toast } = useToast()
toast.success('Perfil aprobado correctamente')
toast.error('No se pudo procesar la solicitud')
toast.warn('Acción irreversible')
```

---

### [x] 1.2 Modal de Confirmación para Acciones Destructivas
**Archivos:** `components/admin/ui/ConfirmModal.tsx`  
**Descripción:** Modal glassmorphism que bloquea la pantalla antes de rechazar o eliminar.  
**Comportamiento:**
- Blur del fondo
- Título + descripción de la acción
- Botón cancelar (ghost) + botón confirmar (danger/lime según acción)
- Animación de entrada con `scale + opacity`

---

### [x] 1.3 Sidebar Colapsable
**Archivos:** `components/admin/AdminSidebar.tsx` (modificado)  
**Descripción:** Toggle entre modo expandido (240px) y colapsado (64px, solo iconos con tooltip).  
**Estado:** Persistido en `localStorage` clave `oc-admin-sidebar`.  
**Comportamiento:**
- Transición suave `width` 240 → 64px con `transition-all duration-300`
- Labels desaparecen con fade
- Tooltips en modo colapsado (via `title` o popover)
- Botón toggle en el borde inferior del sidebar

---

### [x] 1.4 Skeleton Loaders por Sección
**Archivos:** `components/admin/ui/Skeleton.tsx`  
**Descripción:** Reemplaza el spinner global con skeletons específicos por sección.  
**Variantes:** `SkeletonStat`, `SkeletonRow`, `SkeletonCard`  
**Animación:** Shimmer `linear-gradient` de izquierda a derecha (ya existe en `globals.css` como `.skel`).

---

## Fase 2 — Datos en Tiempo Real 📊

### [x] 2.1 Filtros Funcionales en Tabla de Pendientes
**Archivos:** `components/admin/AdminPendingTable.tsx` (modificado)  
**Descripción:** Los subtabs (Jugadores, Técnicos, Clubes, Representantes) filtran realmente.  
**Además:** Input de búsqueda por nombre + select de país.

---

### [x] 2.2 Real-time con Firestore `onSnapshot`
**Archivos:** `app/admin/page.tsx`, `lib/firestore.ts`  
**Descripción:** El conteo de pendientes en el badge del sidebar se actualiza automáticamente.  
**Implementación:**
```ts
// lib/firestore.ts — nueva función
export function subscribeToPendingCount(cb: (n: number) => void): () => void
```
El componente usa `useEffect` con cleanup del listener.

---

### [x] 2.3 Exportar CSV
**Archivos:** `lib/exportCsv.ts`, botón en `AdminPendingTable.tsx`  
**Descripción:** Exporta la tabla de pendientes (o filtrada) como `.csv`.  
**Campos:** Nombre, Tipo, Edad, País, Fecha de registro, Motivo.  
**Implementación:** Client-side con `Blob` + `URL.createObjectURL`.

---

### [x] 2.4 Búsqueda en Tabla de Usuarios
**Archivos:** `app/admin/page.tsx`, tab `usuarios`  
**Descripción:** Input de búsqueda por nombre/email + select de rol + select de systemRole.

---

## Fase 3 — Diseño Premium ✨

### [x] 3.1 Command Palette (⌘K / Ctrl+K)
**Archivos:** `components/admin/CommandPalette.tsx`  
**Descripción:** Overlay de búsqueda global que permite:
- Navegar a cualquier tab del admin
- Buscar perfiles/usuarios por nombre
- Acciones rápidas (exportar, crear anuncio)  
**Trigger:** `⌘K` / `Ctrl+K` o botón de lupa en header.

---

### [x] 3.2 Animaciones de Entrada con CSS
**Archivos:** `globals.css` (extend), todos los componentes admin  
**Descripción:** Cards del dashboard entran con `fadeUp` staggered.  
**Sin dependencias externas** — usa las keyframes existentes en `globals.css`.

---

### [x] 3.3 Toggle Modo Compacto / Confortable
**Archivos:** `components/admin/AdminHeader.tsx` (modificado)  
**Descripción:** Botón en el header que alterna densidad de la tabla:
- **Confortable:** padding 14px, texto 13px
- **Compacto:** padding 8px, texto 12px  
**Estado:** `localStorage` clave `oc-admin-density`.

---

### [x] 3.4 Avatar Real del Admin
**Archivos:** `components/admin/AdminHeader.tsx` (modificado)  
**Descripción:** Si `firebaseUser.photoURL` existe, mostrar imagen real en lugar de las iniciales.

---

## Fase 4 — Seguridad / Producción 🔐

### [x] 4.1 Audit Log de Acciones Admin
**Archivos:** `lib/auditLog.ts`, colección Firestore `adminAuditLog`  
**Descripción:** Cada acción admin (aprobar, rechazar, eliminar video, cambiar rol) escribe en Firestore:
```ts
interface AuditEntry {
  adminUid: string
  adminEmail: string
  action: 'approve' | 'reject' | 'delete_video' | 'set_role' | 'toggle_featured'
  targetId: string
  targetType: string
  metadata: Record<string, unknown>
  timestamp: Timestamp
}
```

---

### [x] 4.2 Rate Limiting Client-Side en Acciones Destructivas
**Archivos:** `hooks/useRateLimit.ts`  
**Descripción:** Hook que impide ejecutar la misma acción más de 1 vez por 2 segundos.  
**Implementación:** Map de `lastCallTime` por acción, devuelve `{ limited, execute }`.

---

## Estructura Final de Archivos

```
web/src/
├── app/admin/
│   ├── layout.tsx               ✅ ya existe
│   └── page.tsx                 ✅ (actualizado)
├── components/admin/
│   ├── AdminSidebar.tsx         ✅ (actualizado — colapsable)
│   ├── AdminHeader.tsx          ✅ (actualizado — avatar real, density toggle)
│   ├── AdminStats.tsx           ✅ ya existe
│   ├── AdminCharts.tsx          ✅ ya existe
│   ├── AdminPendingTable.tsx    ✅ (actualizado — filtros + export)
│   ├── AdminActivity.tsx        ✅ ya existe
│   ├── AdminVideos.tsx          ✅ ya existe
│   ├── AdminQuickActions.tsx    ✅ ya existe
│   ├── CommandPalette.tsx       ✅ (nuevo)
│   └── ui/
│       ├── ToastProvider.tsx    ✅ (nuevo)
│       ├── ConfirmModal.tsx     ✅ (nuevo)
│       └── Skeleton.tsx         ✅ (nuevo)
├── hooks/
│   ├── useToast.ts              ✅ (nuevo)
│   └── useRateLimit.ts          ✅ (nuevo)
└── lib/
    ├── exportCsv.ts             ✅ (nuevo)
    └── auditLog.ts              ✅ (nuevo)
```

---

## Notas de Diseño

- **Colores:** Siempre usar tokens del design system (`--oc-lime: #AAFF00`, etc.)
- **Animaciones:** CSS puro, sin dependencias externas (framer-motion NO instalado)
- **Accesibilidad:** `aria-label` en todos los botones de icono, `role="dialog"` en modales
- **Performance:** Los listeners de Firestore se limpian en el `useEffect` cleanup
