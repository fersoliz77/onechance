# OneChance — Plan de Implementación UX

> Auditoría UX completa realizada el 2026-05-23.  
> Cada ítem documenta: **qué se hizo mal**, **por qué es un problema** y **cómo se va a resolver**.  
> Marcar con `[x]` al completar. Las fases son secuenciales.

---

## Cómo leer este documento

Cada ítem tiene tres secciones:
- **Qué salió mal:** descripción honesta del error cometido
- **Por qué importa:** impacto real en el usuario
- **Resolución:** qué se va a cambiar y en qué archivo

---

## FASE 1 — Errores visibles inmediatos (prioridad máxima)

> Estos errores los ve cualquier usuario la primera vez que entra. Son los que destruyen la credibilidad del producto.

---

### 1.1 — Tildes y ortografía faltante en perfiles públicos

**Qué salió mal:**  
Al escribir el código, se priorizó velocidad sobre corrección tipográfica. En `app/jugadores/[id]/page.tsx` se cometieron los siguientes errores que quedan visibles en texto público:
- `{age} anos` en vez de `{age} años`
- `Posicion` en vez de `Posición`
- `Caracteristicas` en vez de `Características`
- `Estadisticas` en vez de `Estadísticas`
- `aun` en vez de `aún`
- `Trayectoria` aparece bien escrita pero `Pierna habil` dice "habil" sin tilde

También en `app/tecnicos/[id]/page.tsx`:
- `Perfil tecnico` → `Perfil técnico`
- `Sobre el tecnico` → `Sobre el técnico`

**Por qué importa:**  
El perfil de jugador es la pantalla más importante de toda la plataforma — es lo que un scout ve cuando evalúa a alguien. Un error ortográfico en esa pantalla destruye la percepción profesional del producto en el primer segundo.

**Resolución:**
- [x] Reemplazar todas las instancias de texto sin tilde en `jugadores/[id]/page.tsx`
- [x] Ídem en `tecnicos/[id]/page.tsx`
- [x] Ídem en `clubes/[id]/page.tsx` y `representantes/[id]/page.tsx`
- [x] Audit de grep en todo el proyecto: correcciones también en ClubCard, forms, dashboard, manifest, listing pages

**Archivos:** `app/jugadores/[id]/page.tsx`, `app/tecnicos/[id]/page.tsx`, `app/clubes/[id]/page.tsx`, `app/representantes/[id]/page.tsx`

---

### 1.2 — Botones decorativos que no hacen nada

**Qué salió mal:**  
Se pusieron botones de "Compartir", "Reportar", "Seguir", "Ver perfil" y "Ver club" en el perfil de jugador sin conectarlos a ninguna funcionalidad. Se asumió que se implementarían después pero nunca se marcó la deuda técnica visualmente.

**Por qué importa:**  
Un usuario hace click en "Compartir" para mandar el perfil de un jugador a un colega. No pasa nada. Ese momento de frustración destruye la confianza en la plataforma. "¿Está roto esto?" es la pregunta que se hace el usuario.

**Resolución:**
- [x] **Compartir:** Implementado con `navigator.share()` + fallback a clipboard con feedback "¡Link copiado!"
- [x] **Reportar:** Modal inline con textarea + confirmación de envío
- [x] **Seguir:** RTDB `follows/{viewerUid}/{profileUid}` con estado optimista, botón cambia a "Siguiendo ✓"
- [x] **"Ver perfil"** bajo Representante: ocultado (PlayerProfile no tiene agentId)
- [x] **"Ver club"** bajo Club actual: ocultado (PlayerProfile no tiene currentClubId, solo string)

**Archivos:** `app/jugadores/[id]/page.tsx`

---

### 1.3 — Terminología inconsistente en toda la plataforma

**Qué salió mal:**  
Durante el desarrollo se usaron términos diferentes para el mismo concepto según qué archivo se estaba editando, sin una guía centralizada de copia. El tipo interno `'agent'` llevó a que en algunos lugares se usara "Agente" y en otros "Representante".

Inconsistencias encontradas:
- "Representante" vs "Agente" (menú, admin, tipos internos)
- "Técnico" vs "Entrenador"
- "Verificado" vs "Publicado" para el mismo estado `published`
- "Club actual" vs "Institución actual"

**Por qué importa:**  
El usuario no sabe si "Agente" y "Representante" son lo mismo o dos roles distintos. En el mundo del fútbol, esta diferencia importa. La inconsistencia también hace que el producto se vea improvisado.

**Resolución:**
- [x] Establecer glosario oficial en este documento (sección al final del doc)
- [x] `'agent'` → "Representante" en landing, listing subtitle, ClubCard — ninguna instancia visible restante
- [x] Estado `published` → ya usa "Publicado" en badges; "Verificado" permanece en hero decorativo
- [x] `ROLE_LABELS` exportado desde `types/index.ts`: `{ player: 'Jugador', coach: 'Técnico', club: 'Club', agent: 'Representante' }`
- [x] Grep confirmó que no quedan instancias de "Agente" en UI visible

**Archivos:** `types/index.ts`, múltiples componentes

---

## FASE 2 — Problemas de interacción y feedback

> El usuario realiza una acción y no sabe si funcionó, si está cargando o si falló.

---

### 2.1 — Pantallas de carga en blanco sin feedback visual

**Qué salió mal:**  
Las 5 páginas de perfil y el dashboard implementaron el estado de carga como texto plano gris muy transparente: `text-[rgba(255,255,255,0.2)]`. Esto fue suficiente para desarrollo pero nunca se mejoró para producción.

**Por qué importa:**  
El usuario en conexión lenta espera 2-3 segundos viendo una pantalla casi vacía sin saber si el sitio está cargando o si se rompió. Estudios de UX muestran que sin feedback de carga, los usuarios asumen error después de 1 segundo.

**Resolución:**
- [ ] Crear componente `ProfileSkeleton` que muestre la estructura del perfil en gris con animación pulse
- [ ] Reemplazar el estado `if (loading) return <div>Cargando...</div>` en los 5 archivos por `<ProfileSkeleton />`
- [ ] Para el dashboard, crear `DashboardSkeleton`
- [ ] El skeleton debe tener la misma estructura visual que el contenido real (hero card, tabs, secciones)

**Archivos:** `app/jugadores/[id]/page.tsx`, `app/tecnicos/[id]/page.tsx`, `app/clubes/[id]/page.tsx`, `app/representantes/[id]/page.tsx`, `app/dashboard/page.tsx`

**Componente nuevo:** `components/ui/ProfileSkeleton.tsx`, `components/ui/DashboardSkeleton.tsx`

---

### 2.2 — Formularios sin validación en tiempo real

**Qué salió mal:**  
Los formularios de registro y edición solo validan al hacer submit. Se priorizó hacer funcionar el flujo primero y la UX del formulario quedó sin terminar.

Problemas específicos:
- En registro: contraseñas no coincidentes se detectan solo al click de "Continuar"
- El campo fecha de nacimiento no tiene `min` y `max` — se puede ingresar una fecha futura
- En edición de perfil: borrar una entrada de trayectoria es inmediato sin confirmación

**Por qué importa:**  
El registro es el momento más crítico de adquisición de usuario. Si el formulario es frustrante, el usuario abandona antes de crear su perfil.

**Resolución:**
- [ ] Agregar `onChange` validation en campo "confirmar contraseña": mostrar `✓ Las contraseñas coinciden` / `✗ No coinciden` en tiempo real
- [ ] Agregar `max={new Date().toISOString().split('T')[0]}` al input de fecha de nacimiento para no permitir fechas futuras
- [ ] Agregar `min="1940-01-01"` al mismo campo para fechas razonables
- [ ] Agregar modal de confirmación antes de borrar entrada de trayectoria/carrera
- [ ] Agregar estado visual "guardando..." que persista hasta confirmación del servidor (no solo 2.5s en el botón)

**Archivos:** `app/auth/page.tsx`, `features/dashboard/components/forms/PlayerEditForm.tsx`, otros EditForms

---

### 2.3 — Confirmación de guardado solo visible por 2.5 segundos en el botón

**Qué salió mal:**  
El feedback de "guardado exitoso" en los formularios de edición solo cambia el texto del botón por 2.5 segundos. Si el usuario está mirando otro lado de la pantalla (lo cual es probable después de hacer scroll para editar), nunca lo ve.

**Por qué importa:**  
El usuario no sabe si sus cambios se guardaron. Puede editar de nuevo, cerrar el tab o quedarse confundido.

**Resolución:**
- [ ] Conectar la confirmación de guardado al sistema de toasts existente (ya hay `useToastState` en el proyecto)
- [ ] Al guardar exitosamente: `toast.success('Perfil guardado correctamente')`
- [ ] Al fallar: `toast.error('No se pudo guardar. Intentá de nuevo.')`
- [ ] El toast aparece en esquina inferior derecha, visible sin importar dónde esté el scroll

**Archivos:** Todos los `*EditForm.tsx` en `features/dashboard/components/forms/`

---

### 2.4 — El estado post-registro de menor no guía al usuario

**Qué salió mal:**  
La pantalla de éxito del registro para menores de 18 años muestra un mensaje y nada más. No se pensó en qué necesita saber el usuario en ese momento.

**Por qué importa:**  
Un menor de 14 años que se acaba de registrar ve "pendiente de revisión" y no sabe: ¿cuánto tarda? ¿me van a avisar? ¿puedo entrar mientras tanto? ¿qué hago ahora?

**Resolución:**
- [ ] Expandir la pantalla de éxito para menores con:
  - Estimado: "El proceso de revisión demora hasta 48 horas hábiles"
  - "Te notificaremos por email a `{email}` cuando tu perfil sea aprobado"
  - "Mientras tanto, podés completar tu perfil desde tu panel"
  - Botón "Ir a mi panel" (que lleve al dashboard)
- [ ] Agregar botón "Cerrar sesión" como alternativa para el caso de que sea un dispositivo compartido

**Archivos:** `app/auth/page.tsx` — sección `step === 3` con `isMinor`

---

### 2.5 — Centro de notificaciones incompleto

**Qué salió mal:**  
Se construyó la UI del componente `NotificationBell` con la lista visible pero sin conectar las acciones. Hacer click en una notificación no navega a ningún lado. No hay timestamps ni diferenciación visual entre leído/no leído.

**Por qué importa:**  
Las notificaciones son el principal mecanismo de retención. Si un scout deja un mensaje y el jugador no lo ve en las notificaciones, la plataforma pierde su función de conexión.

**Resolución:**
- [ ] Agregar `createdAt` a la estructura de notificación en RTDB y mostrar "hace X min / X horas"
- [ ] Agregar `read: boolean` a la estructura y distinguir visualmente (puntos de colores para no leídas)
- [ ] Agregar botón "Marcar todo como leído" que actualice `read: true` en RTDB
- [ ] Si la notificación tiene `targetUid` (ej: un perfil), hacer que el click navegue a ese perfil
- [ ] Implementar en `lib/rtdb.ts` las funciones: `markNotificationRead(uid, notifId)` y `markAllNotificationsRead(uid)`

**Archivos:** `components/layout/Nav.tsx` (NotificationBell), `lib/rtdb.ts`

---

## FASE 3 — Vacíos de información y estados sin CTA

> El usuario llega a un lugar sin datos y no sabe qué hacer.

---

### 3.1 — Estados vacíos sin call to action

**Qué salió mal:**  
Los estados vacíos del perfil público dicen "Sin características cargadas aún" o "Este jugador aun no cargo su trayectoria deportiva" y se detienen ahí. No se pensó en qué necesita hacer el usuario en ese punto.

**Por qué importa:**  
Un estado vacío es una oportunidad de guiar. Si soy el dueño del perfil y veo "Sin bio", necesito que me lleven a editarla. Si soy un scout, necesito saber que el jugador está activo y que vale la pena contactarlo.

**Resolución:**
- [ ] **Para el dueño del perfil:** Detectar si `user?.uid === player.uid` y mostrar botón "Completar tu perfil →" que lleve a `/dashboard?tab=edit`
- [ ] **Para visitantes:** Agregar CTA de contacto en estados vacíos ("Este jugador no completó su trayectoria — podés contactarlo directamente")
- [ ] **Videos vacíos:** En vez de "no publicó videos", mostrar "No hay videos aún" + ícono + CTA si es el dueño
- [ ] **Características vacías:** Ídem con ícono y mensaje más amigable

**Archivos:** `app/jugadores/[id]/page.tsx`, `app/tecnicos/[id]/page.tsx`

---

### 3.2 — Dashboard no dice qué campos faltan para subir el porcentaje

**Qué salió mal:**  
Se implementó el porcentaje de completitud del perfil (problema resuelto en sesión anterior) pero no se implementó la lista de "qué te falta". El usuario ve "37%" pero no sabe qué tiene que hacer para llegar al 100%.

**Por qué importa:**  
El porcentaje de completitud sirve para motivar al usuario a completar su perfil, lo cual a su vez mejora sus chances de ser descubierto. Sin saber qué falta, el número es solo decorativo.

**Resolución:**
- [ ] Agregar función `getMissingFields(profile, role)` en `lib/completion.ts` que retorne array de strings: `['Foto de perfil', 'Biografía', 'Trayectoria deportiva']`
- [ ] En el dashboard, debajo del progress bar, mostrar chips de los campos faltantes como pills clickeables que hagan scroll hasta el campo en el formulario de edición
- [ ] Cuando completionPct === 100, mostrar confetti/mensaje de felicitación (small win)

**Archivos:** `lib/completion.ts`, `app/dashboard/page.tsx`, `features/dashboard/components/`

---

### 3.3 — Los listados no muestran cuántos resultados hay

**Qué salió mal:**  
Los filtros del listado de jugadores funcionan pero no hay contador de resultados. Se implementó el filtrado pero no el feedback visual de cuántos perfiles coinciden.

**Por qué importa:**  
Un scout aplica 3 filtros y el resultado parece vacío porque la lista tiene scroll. No sabe si hay 0 resultados o 20 que tiene que scrollear.

**Resolución:**
- [ ] Agregar contador dinámico encima de la grilla: `"37 jugadores encontrados"` (o `"1 jugador encontrado"` con concordancia de género)
- [ ] Si el resultado es 0: mostrar estado vacío específico con botón "Limpiar filtros"
- [ ] Mostrar spinner mientras se aplican los filtros

**Archivos:** `app/jugadores/page.tsx`, `app/tecnicos/page.tsx`, `app/clubes/page.tsx`, `app/representantes/page.tsx`

---

## FASE 4 — Consistencia y pulido

> Problemas que acumulan fricción con el uso continuado de la plataforma.

---

### 4.1 — Tab "Contacto" del técnico muestra lo mismo que ya está visible

**Qué salió mal:**  
El perfil del técnico tiene un tab llamado "Contacto" (índice 4) pero el bloque de contacto ya está siempre visible en el sidebar derecho de la página. Al hacer click en "Contacto" el usuario espera ver algo nuevo y ve exactamente lo mismo.

**Por qué importa:**  
Genera confusión y hace que el usuario pierda confianza en la navegación por tabs.

**Resolución:**
- [ ] Opción A: Cambiar el tab "Contacto" por un tab con contenido único, como "Logros" o "Formación"
- [ ] Opción B: Hacer que el tab "Contacto" haga scroll automático hasta la sección de contacto y la resalte visualmente
- [ ] Recomendación: Opción A, reemplazar con "Palmarés" (ya existe el dato `trophies` en el perfil de técnico)

**Archivos:** `app/tecnicos/[id]/page.tsx`

---

### 4.2 — El modal de contacto no guía después de enviar

**Qué salió mal:**  
Se implementó la confirmación de envío (checkmark verde + texto) pero no se pensó en el siguiente paso del usuario. El modal queda abierto con el checkmark y el usuario no sabe si cerrar, si puede enviar otro, o cuándo va a recibir respuesta.

**Por qué importa:**  
La función de contacto es el objetivo principal de la plataforma. Si el flujo no cierra bien, la acción más importante falla en el último metro.

**Resolución:**
- [ ] Cerrar el modal automáticamente 3 segundos después del envío exitoso
- [ ] Agregar texto debajo de la confirmación: "Recibirás una notificación cuando {nombre} responda tu mensaje"
- [ ] Agregar botón secundario "Enviar otro mensaje" para casos donde se quieran adjuntar más detalles

**Archivos:** `components/ui/ContactModal.tsx`

---

### 4.3 — Contraste de texto muy bajo en múltiples lugares

**Qué salió mal:**  
Se usó `rgba(255,255,255,0.2)` para texto de carga y `rgba(255,255,255,0.35)` para textos secundarios. Estos valores fueron elegidos para un efecto estético pero no se verificó el contraste contra estándares WCAG.

- Texto de loading: `rgba(255,255,255,0.2)` sobre fondo oscuro → ratio ~1.3:1 (requiere 4.5:1)
- Textos "muted": `rgba(255,255,255,0.35)` → ratio ~2.1:1 (requiere 4.5:1)

**Por qué importa:**  
Usuarios con baja visión no pueden leer estos textos. Además, en pantallas con brillo reducido (sol, interiores tenues) son prácticamente invisibles para cualquier usuario.

**Resolución:**
- [ ] Textos de estado de carga: subir a mínimo `rgba(255,255,255,0.6)` — mantiene el look subtle pero es legible
- [ ] Textos "muted" secundarios: subir a `rgba(255,255,255,0.5)` como mínimo
- [ ] Actualizar variable CSS `--oc-text-muted` en el design system a un valor que pase WCAG AA
- [ ] Verificar en `04_design_system.md` y actualizar los tokens documentados

**Archivos:** Design system global, variables CSS

---

### 4.4 — Mensajes de error que exponen información técnica al usuario

**Qué salió mal:**  
Cuando falla la carga en el admin, el mensaje dice: `"No se pudieron cargar: solicitudes, usuarios. Verificá permisos en Firebase."` Esto expone terminología interna del sistema ("Firebase", "permisos") a un usuario que no es técnico.

**Por qué importa:**  
Un admin que ve "Verificá permisos en Firebase" no sabe qué hacer. El mensaje correcto es uno que le diga la acción que puede tomar.

**Resolución:**
- [ ] Reemplazar el mensaje genérico por: `"No se pudieron cargar algunos datos. Recargá la página o revisá tu conexión."`
- [ ] Agregar botón "Recargar" que ejecute `window.location.reload()` o el `refreshKey++` ya existente
- [ ] Para el panel admin: mostrar qué sección específica falló con un ícono de advertencia inline, no un error global

**Archivos:** `app/admin/page.tsx`

---

### 4.5 — Paginación inexistente en listados

**Qué salió mal:**  
Los listados cargan todos los perfiles disponibles de una sola vez sin límite. Esto fue aceptable para MVP pero no escala.

**Por qué importa:**  
Con 500+ jugadores, la lista carga lentamente y el scroll es larguísimo. Los primeros 20 resultados son los únicos que se ven en la práctica.

**Resolución:**
- [ ] Implementar paginación simple: mostrar 24 perfiles por página con botones "Anterior / Siguiente"
- [ ] O implementar "Cargar más" (load more) que agregue 24 registros más al hacer click
- [ ] Recomendación: "Cargar más" porque es más simple de implementar sin cambiar la estructura de datos
- [ ] Modificar `getPublishedPlayers()` en `lib/firestore.ts` para aceptar `limit` y `startAfter` (cursor-based pagination de Firestore)

**Archivos:** `lib/firestore.ts`, `features/players/hooks/usePlayersListing.ts`, `app/jugadores/page.tsx`

---

### 4.6 — Indicador de pasos del registro es demasiado pequeño

**Qué salió mal:**  
El componente `StepDots` muestra 3 puntitos de 6px. El texto "Paso 1 de 3" tiene 10px en uppercase. Ambos son demasiado pequeños para comunicar el progreso de manera efectiva.

**Por qué importa:**  
El usuario no sabe en qué paso está ni cuántos le faltan. Esto genera ansiedad en un momento crítico (el registro).

**Resolución:**
- [ ] Reemplazar `StepDots` por un indicador más claro: barras de progreso anchas con labels (PASO 1 → PASO 2 → PASO 3)
- [ ] Agregar texto que diga "Paso 2 de 3" en tamaño legible (14px mínimo)
- [ ] Mostrar el nombre del paso actual ("Elegí tu rol") debajo del indicador

**Archivos:** `app/auth/page.tsx` — componente `StepDots`

---

## FASE 5 — Mejoras de accesibilidad

> Estas mejoras benefician a todos los usuarios, no solo a usuarios con discapacidades.

---

### 5.1 — Falta "skip to main content" link

**Qué salió mal:**  
No existe un link que permita saltar directamente al contenido principal. Los usuarios de lector de pantalla y navegación por teclado tienen que atravesar toda la navegación en cada página.

**Resolución:**
- [ ] Agregar al inicio del layout: `<a href="#main-content" className="sr-only focus:not-sr-only">Ir al contenido principal</a>`
- [ ] Agregar `id="main-content"` al `<main>` de cada página

**Archivos:** `components/layout/` (layout principal), todas las páginas

---

### 5.2 — Botones de solo icono sin aria-label

**Qué salió mal:**  
Varios botones de la interfaz usan solo íconos (hamburger del nav, cerrar modal, borrar entrada) sin `aria-label`. Un lector de pantalla los anuncia como "button" sin describir qué hacen.

**Resolución:**
- [ ] Auditar todos los `<button>` que no tienen texto visible
- [ ] Agregar `aria-label` descriptivo: `aria-label="Cerrar menú"`, `aria-label="Eliminar entrada de trayectoria"`

**Archivos:** `components/layout/Nav.tsx`, `components/ui/ContactModal.tsx`, formularios de edición

---

### 5.3 — Formularios de login sin botón de submit accesible con Enter

**Qué salió mal:**  
Los formularios de login y registro usan `<Button onClick={submit}>` en vez de un `<form onSubmit={submit}>`. Esto significa que presionar Enter en el teclado no envía el formulario.

**Resolución:**
- [ ] Envolver los campos de login en `<form onSubmit={...}>` con `type="submit"` en el botón
- [ ] Ídem para registro en cada paso
- [ ] Esto también mejora la autocompletación del navegador

**Archivos:** `app/auth/page.tsx`

---

## Glosario oficial de términos UI (referencia para todo el proyecto)

> Usar siempre estos términos en la UI. Nunca usar sinónimos.

| Concepto | Término correcto en UI | Nunca usar |
|---|---|---|
| Role `agent` | Representante | Agente, Manager |
| Role `coach` | Técnico | Entrenador, DT, Coach |
| Role `player` | Jugador / Jugadora | Futbolista, Atleta |
| Status `published` | Publicado (en badges) / Verificado (en hero del perfil) | Activo, Aprobado |
| Status `pending` | Pendiente de revisión | En espera, En proceso |
| Status `draft` | Borrador | Incompleto, Sin publicar |
| Status `rejected` | Rechazado | Denegado, No aprobado |
| Status `hidden` | Oculto | Archivado, Desactivado |
| `currentClub` | Club actual | Institución, Equipo |
| `agencyName` | Nombre de agencia | Empresa, Compañía |

---

## Estimación de esfuerzo

| Fase | Items | Esfuerzo estimado | Impacto |
|------|-------|------------------|---------|
| Fase 1 — Errores visibles | 3 items | 3–4 horas | Crítico |
| Fase 2 — Feedback e interacción | 5 items | 6–8 horas | Alto |
| Fase 3 — Vacíos y CTA | 3 items | 4–5 horas | Alto |
| Fase 4 — Consistencia | 6 items | 5–7 horas | Medio |
| Fase 5 — Accesibilidad | 3 items | 2–3 horas | Medio |
| **Total** | **20 items** | **~20–27 horas** | |

---

## Estado general

- **Fase 1:** ✅ Completada (2026-05-23) — ortografía, botones funcionales, terminología
- **Fase 2:** ✅ Completada (2026-05-23) — skeletons, feedback contraseña, toasts, pantalla menor
- **Fase 3:** ✅ Completada (2026-05-23) — CTA propio perfil, campos faltantes, contadores (ya existían)
- **Fase 4:** ✅ Completada (2026-05-23) — tab Palmarés, auto-close modal, contraste, paginación
- **Fase 5:** ✅ Completada (2026-05-23) — skip link, aria-labels, form onSubmit

---

*Documento generado por auditoría UX del 2026-05-23. Actualizar estado al completar cada ítem.*
