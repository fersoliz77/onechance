# OneChance — Features V1

## Prioridad de implementación (orden sugerido)

### Fase 1 — Base y autenticación
- [ ] Setup Next.js + TypeScript + Tailwind + Firebase
- [ ] Auth: registro por email, login, logout
- [ ] Selección de rol en registro (3 pasos)
- [ ] Detección automática de menores (< 18 años)
- [ ] Flujo de estado de perfil: draft → pending → published

### Fase 2 — Perfiles públicos
- [ ] Landing page (marketing)
- [ ] Listado de jugadores con filtros
- [ ] Perfil individual de jugador
- [ ] Listado y perfil de técnicos
- [ ] Listado y perfil de clubes
- [ ] Listado y perfil de representantes

### Fase 3 — Dashboard privado
- [ ] Vista general (estado, completitud, stats)
- [ ] Edición de datos: básicos / trayectoria / características
- [ ] Gestión de videos (embed + upload)
- [ ] Gestión de fotos
- [ ] Configuración de visibilidad
- [ ] Envío a revisión

### Fase 4 — Admin
- [ ] Panel de resumen (stats globales)
- [ ] Aprobación/rechazo de perfiles pendientes
- [ ] Alerta especial para menores de edad
- [ ] Tabla de usuarios con búsqueda
- [ ] Moderación de videos (ocultar/eliminar)
- [ ] Gestión de destacados

---

## Feature: Videos

### Tipos soportados
| Tipo | Cómo | Fuentes |
|------|------|---------|
| Embed | Usuario pega URL | YouTube, Vimeo, TikTok, Instagram |
| Upload | Sube archivo | MP4, MOV — máx 200 MB |

### Admin
- Ver todos los videos de cualquier perfil
- Ocultar o eliminar individual

---

## Feature: Menores de edad

El sistema detecta automáticamente si `birthDate` corresponde a < 18 años:
1. Muestra alerta en el formulario de registro
2. Al enviar a revisión → estado `pending` automático
3. Admin debe aprobar manualmente (sección "Pendientes" con badge de alerta)
4. El perfil nunca se publica sin aprobación de admin

---

## Feature: Perfil destacado

- El admin puede marcar/desmarcar jugadores como destacados desde `/admin → Destacados`
- Un jugador destacado muestra badge `★ DEST.` en su tarjeta en el listado
- Barra verde en el top de la tarjeta
- Aparece primero en el listado (ordering)
- Preparado para cobro futuro (campo `isFeatured` en DB)

---

## Feature: Monetización (preparada, no activa en V1)

| Plan | Precio referencia |
|------|-----------------|
| Perfil jugador básico | USD 2 |
| Perfil jugador destacado | USD 5 |
| Perfil técnico | USD 15 |
| Perfil club | USD 10 |
| Perfil representante | USD 15 |

La estructura de precios queda en DB pero los pagos no se procesan en V1.
