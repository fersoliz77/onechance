# OneChance — Inventario de pantallas

Todos los mockups están en `OneChance mockup basicos/ui_kits/`.

## Pantallas públicas (sin login)

### 1. Landing (`/`)
- **Mockup:** `one_chance_landing.html`, `landing_hero_deportiva.html`
- **Componentes:** Nav, Hero asimétrico 3 col, PlayerCard flotante, CoachCard, RoleStrip, Ticker
- **CTA principales:** "Publicar perfil" → registro, "Ver jugadores" → listado

### 2. Jugadores — listado (`/jugadores`)
- **Mockup:** `PlayersScreen.jsx` → `PlayersListScreen`
- **Sidebar filtros:** sexo, categoría edad (13-17 / 18-22 / 23-30), puesto, nacionalidad, pierna
- **Grid:** tarjetas PlayerCard con nombre, posición, OVR, edad, bandera

### 3. Jugador — perfil individual (`/jugadores/[id]`)
- **Mockup:** `PlayersScreen.jsx` → `PlayerProfileScreen`
- **Secciones:** Hero con escudo/avatar flotante, datos físicos, características, trayectoria, videos, fotos, sidebar contacto

### 4. Técnicos — listado (`/tecnicos`)
- **Mockup:** `ProfileScreens.jsx` → `TecsScreen`
- **Cards:** avatar, nombre, años exp., skills (3 chips), disponibilidad

### 5. Técnico — perfil individual (`/tecnicos/[id]`)
- **Mockup:** `ProfileScreens.jsx` → `CoachProfileScreen`
- **Acento:** azul #5A8FFF, escudo azul, bio, trayectoria, logros

### 6. Clubes — listado (`/clubes`)
- **Mockup:** `ProfileScreens.jsx` → `ClubsScreen`
- **Cards:** nombre, división, país, presidente, DT, posiciones buscadas

### 7. Club — perfil individual (`/clubes/[id]`)
- **Mockup:** `ProfileScreens.jsx` → `ClubProfileScreen`
- **Acento:** amarillo #FFB400, datos institucionales, logros, ubicación

### 8. Representantes — listado (`/representantes`)
- **Mockup:** `ProfileScreens.jsx` → `AgentsScreen`
- **Cards:** agencia, jugadores, países, mercados

### 9. Representante — perfil individual (`/representantes/[id]`)
- **Mockup:** `ProfileScreens.jsx` → `AgentProfileScreen`
- **Acento:** púrpura #B464FF, transferencias destacadas

---

## Pantallas de auth

### 10. Auth — Login / Registro (`/auth`)
- **Mockup:** `AuthScreen.jsx`
- **Login:** email + contraseña, link a "olvidé contraseña"
- **Registro:** 3 pasos: (1) credenciales → (2) selección de rol → (3) datos básicos + fecha nacimiento
- **Detección de menor:** si edad < 18 → alerta + perfil queda en `pending` automáticamente

---

## Pantallas privadas (con login)

### 11. Dashboard del usuario (`/dashboard`)
- **Mockup:** `DashboardScreen.jsx`
- **Sidebar:** Mi perfil / Editar datos / Videos / Fotos / Configuración
- **Overview:** estado del perfil (barra progreso 3 pasos), completitud %, stats rápidas (visitas, videos, fotos)
- **Editar:** tabs Datos básicos / Trayectoria / Características
- **Videos:** lista + agregar (link externo o upload)
- **Fotos:** grid 4 col + upload
- **Config:** toggles de visibilidad, destacado, notificaciones

---

## Panel admin (solo rol admin)

### 12. Admin (`/admin`)
- **Mockup:** `AdminScreen.jsx`
- **Acceso:** nav muestra botón "Admin" solo si `user.role === 'admin'`
- **Sidebar admin:** Resumen / Pendientes (badge contador) / Usuarios / Videos / Destacados
- **Resumen:** stats 2x2 + distribución por rol con barras
- **Pendientes:** lista con aprobar/rechazar, alerta especial para menores
- **Usuarios:** tabla buscable con editar/eliminar
- **Videos:** lista global con ocultar/eliminar
- **Destacados:** toggle por jugador publicado

---

## Estados de perfil

| Estado | Color | Descripción |
|--------|-------|-------------|
| `draft` | gris | Borrador, solo visible para el usuario |
| `pending` | amarillo #FFB400 | En revisión admin |
| `published` | verde #00C853 | Visible públicamente |
| `rejected` | rojo #FF3C3C | Rechazado, usuario puede corregir y reenviar |
| `hidden` | gris oscuro | Oculto por admin, no visible |
