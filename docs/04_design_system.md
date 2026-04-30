# OneChance — Design System

Todos los tokens están definidos en `OneChance mockup basicos/colors_and_type.css`.
Los componentes de referencia están en `ui_kits/platform/Shared.jsx`.

## Colores

### Base
| Token | Valor | Uso |
|-------|-------|-----|
| `bg-base` | `#050A14` | Fondo principal |
| `bg-alt` | `#060D18` | Fondo alternativo (leve tinte azul) |
| `bg-card-green` | `#0C1F12` | Fondo tarjeta jugador |
| `bg-card-blue` | `#0B1A2E` | Fondo tarjeta técnico |

### Marca
| Token | Valor | Uso |
|-------|-------|-----|
| `green-primary` | `#00C853` | Acento principal — CTAs, stats, links activos |
| `green-hover` | `#00E660` | Hover de verde |
| `green-dark` | `#002A12` | Texto sobre botón verde |
| `blue-accent` | `#5A8FFF` | Técnicos, acento secundario |
| `#FFB400` | amarillo | Clubes |
| `#B464FF` | púrpura | Representantes + jugadoras femeninas |

### Texto
| Token | Valor |
|-------|-------|
| `text-primary` | `#FFFFFF` |
| `text-secondary` | `rgba(255,255,255,0.60)` |
| `text-muted` | `rgba(255,255,255,0.35)` |
| `text-dim` | `rgba(255,255,255,0.20)` |

### Bordes
- Grosor siempre `0.5px`
- Neutro: `rgba(255,255,255,0.05–0.15)`
- Verde: `rgba(0,200,83,0.2–0.3)`
- Azul: `rgba(80,140,255,0.2)`

## Tipografía

**Font:** DM Sans (Google Fonts) — sustituye `var(--font-sans)` de los mockups.

| Uso | Tamaño | Peso | Letter-spacing |
|-----|--------|------|---------------|
| Hero / H1 | 52–58px | 500 | -0.04em |
| H2 | 36px | 500 | -0.03em |
| H3 | 24px | 500 | -0.02em |
| Body | 13px | 400 | normal |
| Nav / labels | 12px | 400–500 | normal |
| Stat numbers | 22px | 500 | -0.02em, color verde |
| Badges / labels | 9–11px | 500 | 0.07em, UPPERCASE |

## Componentes (en Tailwind, basados en Shared.jsx)

### OcButton
- `primary` — verde #00C853, texto #002A12, hover: -1px lift + glow verde
- `outline` — borde 0.5px blanco, fondo transparente
- `ghost` — sin borde, color muted → blanco en hover
- `danger` — rojo translúcido
- `green_outline` — borde verde, fondo transparente

### Cards
- **Clip corner** top-right: `clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)`
- `border-radius: 16px 4px 16px 16px`
- Animación float: `translateY(0 ↔ -7px)` 6s ease-in-out infinite

### Backgrounds
- Grid animado: gradiente verde 3% opacity, 48×48px, scroll down infinito 24s
- Orbs: blur 80–90px, verde top-left + azul bottom-right, scale pulse 7–9s
- Scanlines (landing): gradiente oscuro 2.5% opacity cada 4px

## Radios estándar
- Botones: 6–9px
- Cards: 16px (con clip corner)
- Pills / badges: 20px
- Inputs: 8px

## Animaciones
| Nombre | Descripción |
|--------|-------------|
| `oc-fadeUp` | Entrada: opacity 0→1, translateY 16px→0, 0.5s |
| `oc-float` | Tarjetas: bob vertical ±7px, 6s |
| `oc-pulse` | Orbs: scale 1→1.15, 7s |
| `oc-blink` | Punto logo/eyebrow: opacity 1→0.2, 2s |
| `oc-grid` | Fondo: translateY 0→48px, 24s |
| `oc-ticker` | Ticker: translateX 0→-50%, 20s |
