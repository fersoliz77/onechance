# OneChance — Limitaciones conocidas y pendientes técnicos

Este documento registra funcionalidades que están **parcialmente implementadas**: el código existe y los datos persisten correctamente, pero aún no tienen efecto real en la plataforma.

---

## 1. Configuración de plataforma sin efecto

**Archivo:** `web/src/components/admin/AdminConfigPanel.tsx`  
**Datos:** Firestore, colección `platform_config`

El panel de configuración del admin guarda los valores correctamente en Firestore, pero ningún flag está conectado a lógica real todavía:

| Flag | Dónde debería actuar | Estado |
|------|---------------------|--------|
| `maintenanceMode` | `middleware.ts` → redirigir todo a `/maintenance` | ⏳ pendiente |
| `registrationEnabled` | `AuthModal` o `middleware.ts` → bloquear registro | ⏳ pendiente |
| `autoApproveProfiles` | API de creación de perfil → publicar directo sin revisión | ⏳ pendiente |
| `subscriptionsEnabled` | Pricing pages, dashboard | ⏳ pendiente |
| `messagingEnabled` | Módulo de mensajes (no construido aún) | ⏳ pendiente |
| `ambassadorsEnabled` | Módulo de embajadores (no construido aún) | ⏳ pendiente |
| `maxVideosPerPlayer` | Upload de videos en el perfil | ⏳ pendiente |
| `requireEmailVerification` | Firebase Auth + registro | ⏳ pendiente |

**Impacto actual:** ninguno. El admin puede cambiar estos valores y se guardan, pero la plataforma se comporta igual.

---

## 2. Protección de rutas solo client-side

**Archivos:** `web/src/app/admin/page.tsx`, `web/src/app/dashboard/page.tsx`

Las rutas `/admin` y `/dashboard` tienen guards de autenticación en el cliente (React), pero no existe `middleware.ts` para protegerlas a nivel servidor. Un usuario con la URL directa puede acceder brevemente antes de que el guard cliente actúe, y las rutas de API admin dependen únicamente del token Bearer en el header.

**Pendiente:** crear `web/src/middleware.ts` que valide sesión antes de servir las rutas protegidas.

---

## 3. Métricas del landing hardcodeadas

**Archivo:** `web/src/app/page.tsx` (sección de stats)

Los números que aparecen en el landing (jugadores registrados, clubes, etc.) son valores estáticos en el código. No leen Firestore.

**Pendiente:** query a Firestore para contar documentos por colección, con caché/revalidación.

---

## 4. Tabs de perfil público sin funcionamiento

**Archivo:** `web/src/app/jugadores/[id]/page.tsx`

Las tabs de navegación dentro del perfil público de un jugador tienen `aria-selected={i===0}` hardcodeado y no tienen `onClick`. Solo se muestra el contenido de la primera tab sin importar cuál está activa.

**Pendiente:** agregar estado local + condicional de render por tab activa.

---

## 5. Formularios de edición sin manejo de errores

**Archivos:** `PlayerEditForm.tsx`, `CoachEditForm.tsx`, `ClubEditForm.tsx`, `AgentEditForm.tsx`

Los `fetch` de guardado no tienen bloque `catch`. Si la API falla, el formulario no muestra ningún mensaje y el usuario no sabe si se guardó o no.

**Pendiente:** agregar `try/catch` y mostrar toast de error.

---

## 6. Links del footer

**Archivo:** `web/src/components/Footer.tsx` (o similar)

Todos los links del footer usan `href="#"`. No están conectados a rutas reales ni a páginas de contenido legal (términos, privacidad, etc.).

**Pendiente:** definir rutas o contenido mínimo para cada link.

---

*Última actualización: Mayo 2026*
