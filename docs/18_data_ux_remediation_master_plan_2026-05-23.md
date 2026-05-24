# OneChance — Plan Maestro de Remediación UX + Datos (Firestore/Realtime)

> Fecha: **2026-05-23**  
> Alcance: plan operativo completo, paso por paso, para corregir problemas detectados en UX, arquitectura de datos, seguridad y confiabilidad.  
> Criterio de datos vigente del proyecto:  
> - **Firestore** para datos estables o de cambio poco frecuente (perfil base, catálogo, configuración, historial auditado).  
> - **Realtime Database** para datos críticos de alta frecuencia o interacción en vivo (notificaciones, mensajería, estados instantáneos, señales de presencia/eventos).

---

## Cómo usar este documento

Cada paso tiene exactamente estas 3 secciones:

1. **Qué está mal hoy**
2. **Qué se va a hacer**
3. **Cómo queda solucionado y cómo va a funcionar**

Marcar avance con:
- `[ ]` pendiente
- `[~]` en curso
- `[x]` completado

---

## Fase 0 — Contención inmediata (bloqueantes)

### Paso 0.1 — Credenciales sensibles en repositorio
- Estado: `[ ]`
- Qué está mal hoy:
  - Existe un archivo de credenciales de Firebase Admin en la raíz del repo (`onechance-platform-firebase-adminsdk-fbsvc-7be594e495.json`).
- Qué se va a hacer:
  - Remover el archivo del repositorio.
  - Rotar claves/credenciales en Firebase.
  - Mover la credencial a secretos de entorno del proveedor (Vercel/CI/local secure env).
  - Agregar validación de pre-commit/pre-push para bloquear subida de secretos.
- Cómo queda solucionado y cómo va a funcionar:
  - No habrá secretos persistidos en Git.
  - El backend seguirá autenticando con credenciales inyectadas por entorno, no por archivo en repo.
  - Se reduce riesgo de compromiso total del proyecto por filtración histórica.

### Paso 0.2 — Validar reglas de acceso por base de datos (Firestore vs Realtime)
- Estado: `[ ]`
- Qué está mal hoy:
  - Se observan reglas de RTDB (`web/database.rules.json`), pero no hay evidencia de reglas Firestore versionadas en este repo.
  - La app usa Firestore para datos sensibles (`users`, perfiles por rol), por lo que reglas laxas serían un riesgo alto.
- Qué se va a hacer:
  - Versionar reglas Firestore en el repo y documentar política de permisos por colección.
  - Definir y aplicar principio de mínimo privilegio para lecturas/escrituras.
  - Agregar pruebas de reglas (casos permitidos/denegados) en CI.
- Cómo queda solucionado y cómo va a funcionar:
  - Firestore y RTDB tendrán contratos de seguridad explícitos y auditables.
  - El frontend no podrá leer datos fuera de su alcance, aun si hay errores de UI.

---

## Fase 1 — Arquitectura de datos objetivo (estándar oficial)

## 1.1 Matriz de fuente de verdad

| Dominio | Base objetivo | Frecuencia | Motivo |
|---|---|---|---|
| Perfil base (nombre, bio, país, posición, estado, flags) | Firestore | Baja/Media | Consistencia, indexación, queries y trazabilidad |
| Configuración de perfil (estructura estable) | Firestore | Baja | Persistencia fuerte y fácil auditoría |
| Notificaciones inbox | Realtime | Alta | Actualización instantánea, UX en vivo |
| Mensajes/contacto | Realtime | Alta | Flujo conversacional en tiempo real |
| Follows / señales de interacción rápida | Realtime | Alta | Escrituras frecuentes y lectura reactiva |
| Auditoría administrativa inmutable | Firestore | Baja/Media | Historial durable, consulta analítica |
| Conteos públicos agregados | Firestore (o materializado por job) | Media | Consistencia para landing/listados |

### Paso 1.2 — Resolver doble escritura de estado de perfil
- Estado: `[ ]`
- Qué está mal hoy:
  - El estado de perfil se toca en Firestore y RTDB en paralelo en algunos flujos.
- Qué se va a hacer:
  - Definir una sola fuente de verdad para `status` (recomendado: Firestore).
  - RTDB solo guarda señales de tiempo real derivadas (si son necesarias), no estado canónico.
  - Crear función de sincronización backend (idempotente) para casos legados.
- Cómo queda solucionado y cómo va a funcionar:
  - Se evita drift entre bases.
  - Cualquier pantalla que consulte estado tendrá una respuesta única y consistente.

### Paso 1.3 — Contratos de datos por colección/nodo
- Estado: `[ ]`
- Qué está mal hoy:
  - Hay campos opcionales y formatos heterogéneos en distintas pantallas.
- Qué se va a hacer:
  - Definir contratos por entidad (required, optional, defaults, validaciones).
  - Versionar esquema y reglas de migración cuando cambie un campo.
  - Alinear formularios con dichos contratos.
- Cómo queda solucionado y cómo va a funcionar:
  - Menos errores de render y menos validaciones ad-hoc en frontend.
  - Las nuevas features se apoyan en estructura estable.

---

## Fase 2 — Remediación UX funcional (de “se ve bien” a “funciona bien”)

### Paso 2.1 — Tabs decorativas sin comportamiento real
- Estado: `[ ]`
- Qué está mal hoy:
  - Existen tabs que no cambian contenido real o no representan una sección operativa clara.
- Qué se va a hacer:
  - Convertir tabs en navegación real o eliminar tabs sin contenido.
  - Sincronizar tab activa en URL (`searchParams`) para compartir estado.
- Cómo queda solucionado y cómo va a funcionar:
  - El usuario entiende dónde está, qué cambió y puede compartir enlaces exactos.

### Paso 2.2 — Acción “Reportar perfil” sin persistencia backend
- Estado: `[ ]`
- Qué está mal hoy:
  - El flujo de reporte hoy muestra feedback visual local pero no persiste evidencia operativa.
- Qué se va a hacer:
  - Crear endpoint seguro para reportes.
  - Guardar reporte en colección Firestore de moderación.
  - Generar notificación administrativa en RTDB para revisión rápida.
- Cómo queda solucionado y cómo va a funcionar:
  - Cada reporte queda trazado, visible para moderación y con estado de tratamiento.

### Paso 2.3 — Feedback de errores y estados de carga
- Estado: `[ ]`
- Qué está mal hoy:
  - Algunas vistas muestran errores técnicos o feedback débil para usuarios no técnicos.
- Qué se va a hacer:
  - Estandarizar mensajes UX: claros, accionables y no técnicos.
  - Unificar skeletons, empty states y toasts por tipo de acción.
- Cómo queda solucionado y cómo va a funcionar:
  - Menos abandono por incertidumbre.
  - Usuario siempre sabe qué pasó y qué hacer después.

### Paso 2.4 — Listados sin estrategia de escala sólida
- Estado: `[ ]`
- Qué está mal hoy:
  - Cargar datasets grandes completos y filtrar en cliente no escala.
- Qué se va a hacer:
  - Implementar paginación/cursor server-driven en Firestore para listados.
  - Mantener en cliente solo estado de filtros y página actual.
- Cómo queda solucionado y cómo va a funcionar:
  - Cargas más rápidas, menor consumo de memoria y experiencia estable en crecimiento.

---

## Fase 3 — Seguridad y autorización aplicada al flujo real

### Paso 3.1 — Lecturas administrativas desde cliente
- Estado: `[ ]`
- Qué está mal hoy:
  - Parte de la lectura admin ocurre directo desde frontend con SDK.
- Qué se va a hacer:
  - Migrar lecturas administrativas sensibles a rutas server (`/api/admin/*`).
  - Devolver solo campos necesarios para UI (principio de minimización).
- Cómo queda solucionado y cómo va a funcionar:
  - Menor superficie de exposición de datos.
  - Permisos centralizados y auditables en backend.

### Paso 3.2 — Hardening de sesión y token
- Estado: `[ ]`
- Qué está mal hoy:
  - El manejo de token en cookie desde cliente no es el patrón más robusto.
- Qué se va a hacer:
  - Migrar a sesión segura con cookie `HttpOnly` emitida desde backend.
  - Revisar expiración, renovación y invalidación de sesión.
- Cómo queda solucionado y cómo va a funcionar:
  - Menor exposición a robo de token por scripts del lado cliente.
  - Flujo de autenticación más seguro y mantenible.

### Paso 3.3 — Auditoría completa de acciones sensibles
- Estado: `[ ]`
- Qué está mal hoy:
  - No todas las acciones críticas quedan necesariamente auditadas de forma uniforme.
- Qué se va a hacer:
  - Definir catálogo de eventos auditables (approve/reject, roles, publicaciones, borrados).
  - Estandarizar campos mínimos de auditoría y retención.
- Cómo queda solucionado y cómo va a funcionar:
  - Se puede reconstruir quién hizo qué, cuándo y sobre qué entidad.

---

## Fase 4 — Calidad técnica y mantenibilidad

### Paso 4.1 — Componentes monolíticos de alta complejidad
- Estado: `[ ]`
- Qué está mal hoy:
  - Pantallas extensas concentran UI, datos y lógica de negocio.
- Qué se va a hacer:
  - Separar por capas: `view`, `hooks`, `services`, `schemas`, `api clients`.
  - Extraer submódulos por dominio (admin, perfiles, listing).
- Cómo queda solucionado y cómo va a funcionar:
  - Menor riesgo al cambiar código, mejor testabilidad y onboarding técnico más rápido.

### Paso 4.2 — Tipado débil / excepciones puntuales
- Estado: `[ ]`
- Qué está mal hoy:
  - Persisten zonas con `any` o casts inseguros.
- Qué se va a hacer:
  - Reemplazar `any` por tipos explícitos.
  - Agregar validación de payloads con esquema en frontera de entrada/salida.
- Cómo queda solucionado y cómo va a funcionar:
  - Menos errores en runtime y cambios más predecibles.

### Paso 4.3 — Observabilidad y trazas
- Estado: `[ ]`
- Qué está mal hoy:
  - Uso disperso de `console.error` sin estrategia central de monitoreo.
- Qué se va a hacer:
  - Integrar canal de errores centralizado (server + client) con contexto de usuario/flujo.
  - Definir niveles de severidad y alarmas mínimas.
- Cómo queda solucionado y cómo va a funcionar:
  - Fallas críticas detectadas antes de impactar masivamente a usuarios.

---

## Fase 5 — Testing y validación por escenarios reales

### Paso 5.1 — Tests dependientes de configuración Firebase real
- Estado: `[ ]`
- Qué está mal hoy:
  - Suites fallan por entorno (`auth/invalid-api-key`) y no por lógica funcional.
- Qué se va a hacer:
  - Mockear capa Firebase en unit tests.
  - Separar tests de integración con entorno controlado.
- Cómo queda solucionado y cómo va a funcionar:
  - Pipeline confiable: cuando falla un test, falla por código, no por setup local.

### Paso 5.2 — E2E de flujos críticos de negocio
- Estado: `[ ]`
- Qué está mal hoy:
  - No hay cobertura completa de punta a punta en los flujos de mayor impacto.
- Qué se va a hacer:
  - Implementar E2E para: registro, edición de perfil, envío a revisión, aprobación admin, visibilidad pública, contacto.
- Cómo queda solucionado y cómo va a funcionar:
  - Se detectan roturas funcionales antes de producción en los caminos más importantes.

### Paso 5.3 — Criterios de aceptación por feature
- Estado: `[ ]`
- Qué está mal hoy:
  - Algunas features se cierran sin definición objetiva de terminado.
- Qué se va a hacer:
  - Definir DoD por feature: UX, seguridad, datos, pruebas, documentación.
- Cómo queda solucionado y cómo va a funcionar:
  - Menos retrabajo y releases más estables.

---

## Fase 6 — Accesibilidad y coherencia UX final

### Paso 6.1 — Patrones de teclado y ARIA en componentes interactivos
- Estado: `[ ]`
- Qué está mal hoy:
  - Menús/tabs/modales pueden no cubrir completamente navegación por teclado y semántica ARIA.
- Qué se va a hacer:
  - Completar patrón accesible: `aria-controls`, `Escape`, foco inicial, retorno de foco y navegación por flechas donde aplique.
- Cómo queda solucionado y cómo va a funcionar:
  - Mejor experiencia para teclado, lectores y usuarios con necesidades de accesibilidad.

### Paso 6.2 — Contraste y legibilidad en tokens de texto
- Estado: `[ ]`
- Qué está mal hoy:
  - Algunos niveles de opacidad/texto secundario pueden quedar por debajo de WCAG AA.
- Qué se va a hacer:
  - Ajustar tokens de color de texto y validar contraste en pantallas clave.
- Cómo queda solucionado y cómo va a funcionar:
  - Lectura más clara y consistente en desktop/móvil y condiciones de brillo variadas.

---

## Orden de ejecución recomendado (secuencial)

1. Fase 0 completa (seguridad y reglas).
2. Fase 1 completa (contrato de arquitectura de datos).
3. Fase 3 (autorización/backend) en paralelo controlado con Fase 2 (UX funcional).
4. Fase 4 (refactor estructural) por módulos sin frenar operación.
5. Fase 5 (tests) y Fase 6 (a11y) como condición de cierre.

---

## Qué hacer / Qué no hacer (guía operativa)

### Hacer
- Centralizar estado canónico de perfil en Firestore.
- Usar RTDB para eventos/lecturas en vivo de alta frecuencia.
- Exponer datos sensibles solo por API backend autorizada.
- Documentar cada entrega con: cambio, motivo, impacto, validación.

### No hacer
- No duplicar estado canónico en Firestore y RTDB sin reconciliación formal.
- No leer colecciones sensibles de admin directamente desde cliente.
- No mergear features sin checklist de pruebas y documentación.
- No subir secretos al repositorio bajo ningún caso.

---

## Checklist de cierre de este plan

- [ ] Secretos removidos y rotados.
- [ ] Reglas Firestore/RTDB versionadas y testeadas.
- [ ] Estado de perfil con fuente de verdad única.
- [ ] Endpoints admin centralizados para lectura/escritura sensible.
- [ ] UX crítica corregida (tabs reales, reportes persistidos, feedback claro).
- [ ] Tests unitarios + integración + E2E en verde.
- [ ] Accesibilidad base validada (teclado, foco, contraste).
- [ ] Documentación transversal actualizada (`05`, `06`, `08`, `10`, `11`, `13`, `15`, `16`).

---

**Responsable:** Equipo OneChance  
**Última actualización:** 2026-05-23
