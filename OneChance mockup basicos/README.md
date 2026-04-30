# One Chance — Design System

## Overview

**One Chance** is a professional football scouting platform — a digital "vidriera" (showcase window) connecting players (male and female, all categories) with clubs, coaches, and representatives across Latin America and beyond. Users create profiles; scouts browse, filter, and discover talent. The platform operates in Spanish with a Latin American football cultural context.

**Sources provided:**
- `change mockup basicos/one_chance_landing.html` — Primary landing page mockup (ONE CHANCE brand)
- `change mockup basicos/landing_hero_deportiva.html` — Alternate hero variant (scout11 brand/prototype)

No Figma links or additional codebases were provided.

---

## Products

| Surface | Description |
|---|---|
| **Landing / Marketing site** | Public-facing page for player/club/coach/rep acquisition. Hero-driven, high visual impact. |
| **Platform (app)** | Profile creation, scouting browsing, filters by position/age/country/category. |

---

## Content Fundamentals

**Language:** Spanish (Latin American, Argentine-inflected). Uses **voseo** (e.g. "Creá tu perfil", "Hacete ver", "Mostrá tu talento") — informal 2nd person "vos" conjugation common in Argentina/Uruguay.

**Tone:** Bold, direct, aspirational. Football culture energy — terse, confident, no fluff.

**Casing:** Title case for nav, ALL CAPS for badges/labels (e.g. "★ DESTACADO", "TÉCNICO VERIFICADO"). Sentence case for body copy.

**Copy style examples:**
- "Tu única oportunidad" — punchy, emotional hook
- "La vidriera donde clubes, representantes y técnicos descubren el talento que están buscando."
- "Creá tu perfil. Hacete ver." — short imperative sentences
- "Plataforma profesional de fútbol" — eyebrow label, factual

**Emoji:** Used sparingly as functional icons in role tags (⚽ 📋 🏟️ 🤝 🌎 📍). Never decorative. Not used in body copy.

**Numbers:** Mixed Spanish/numeric. Stats displayed large and green (1.2k, 84, 47).

**No punctuation gimmicks.** Clean, no exclamation marks in headlines. Confidence doesn't shout.

---

## Visual Foundations

### Colors

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#050A14` | Primary background |
| `--bg-alt` | `#060D18` | Alternate background (slightly blue-tinted) |
| `--bg-card-green` | `#0C1F12` | Player card background |
| `--bg-card-blue` | `#0B1A2E` | Coach/secondary card background |
| `--green-primary` | `#00C853` | Brand green — CTAs, accents, stats |
| `--green-hover` | `#00E660` | Green on hover |
| `--green-dark` | `#002A12` | Text on green buttons |
| `--green-deep` | `#003A18` | Gradient endpoint |
| `--blue-accent` | `#5A8FFF` / `#4A9FFF` | Secondary accent — coaches, availability |
| `--text-primary` | `#FFFFFF` | Headlines |
| `--text-muted` | `rgba(255,255,255,0.35)` | Body / secondary |
| `--text-dim` | `rgba(255,255,255,0.2)` | Labels, inactive |
| `--border-subtle` | `rgba(255,255,255,0.05–0.1)` | Thin borders |
| `--border-green` | `rgba(0,200,83,0.2–0.3)` | Green-tinted card borders |
| `--border-blue` | `rgba(80–100,140–160,255,0.2)` | Blue-tinted card borders |

**Color vibe:** Near-black base with a cool navy undertone. Vivid electric green (#00C853) as the single primary accent. Secondary blue for supporting roles. Very low-saturation ambient backgrounds.

### Typography

- **Font family:** Geometric sans-serif. Mockups reference `var(--font-sans)` (unspecified). Substituted with **DM Sans** from Google Fonts (similar proportions, weight 400–500, clean geometric).
- **Headings:** 52–58px, weight 500, letter-spacing -0.03 to -0.04em, line-height 0.95–1.0
- **Body:** 13px, weight 400, line-height 1.7
- **Nav/labels:** 12px, weight 400–500
- **Small labels:** 9–11px, UPPERCASE, letter-spacing 0.04–0.08em
- **Stat numbers:** 20–22px, weight 500, letter-spacing -0.02 to -0.03em, color `--green-primary`
- **Hero title treatment:** Mix of normal, outlined (transparent + `-webkit-text-stroke`), and italic-skewed slash "/"  in green

### Backgrounds & Textures

- **Animated grid:** `repeating-linear-gradient` at 48×48px, green tinted at 3–4% opacity, scrolling downward infinitely (20–24s)
- **Glow orbs:** Absolutely positioned circles, `filter: blur(70–90px)`, green at 7–12% opacity top-left, blue at 6–8% opacity bottom-right. Breathing scale animation (6–9s ease-in-out)
- **Scanlines:** `repeating-linear-gradient` at 4px intervals, 2.5% opacity black — subtle CRT effect layered on top at z-index 50

### Borders

- **Thickness:** Always `0.5px` — hyper-thin, deliberate
- **Color:** `rgba(255,255,255,0.05–0.15)` for neutral, `rgba(0,200,83,0.2–0.3)` for green accent, `rgba(80,140,255,0.2)` for blue
- **Radius:** 6–9px for buttons, 10px for stat bars/chips, 14–16px for cards, 20px for eyebrow pills

### Cards

- **Shape:** Asymmetric — `clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)` cuts the top-right corner. Border-radius: `16px 4px 16px 16px` (top-right flat to match cut)
- **Green player card:** Dark green gradient background (#0C1F12→#060F09), green border at 0.2–0.25 opacity, green bar accent at top (2px gradient stripe)
- **Blue coach card:** Dark navy (#0B1A2E), blue border, slightly rotated (rotate(2deg) or -2deg)
- **Floating animation:** `translateY(0 → -7px)` 6–7s ease-in-out infinite
- **Inner stat cells:** `rgba(0,200,83,0.06–0.08)` background, 6–7px radius

### Animations

- **Entry:** `fadeUp` — `opacity: 0 → 1`, `translateY(16–18px → 0)`, 0.5s ease. Staggered delays 0.1–0.7s
- **Float:** cards bob up/down, 6–7s ease-in-out infinite
- **Orb pulse:** scale 1→1.15–1.2, opacity 0.8→1, 6–9s ease-in-out infinite alternate
- **Blink:** eyebrow dot + logo dot, opacity 1→0.2, 2s infinite
- **Grid move:** translateY(0→48px) 20–24s linear infinite
- **Ticker:** translateX(0 → -50%) 20–22s linear infinite

### Hover / Press States

- **Primary button (green):** `translateY(-1 to -2px)` + `box-shadow: 0 6–10px 20–28px rgba(0,200,83,0.3–0.35)` lift effect
- **Ghost button:** color opacity increases toward `#fff`
- **Nav links:** color `rgba(255,255,255,0.35)` → `#fff`
- **Role tags:** border-color → `rgba(0,200,83,0.3)`, background → `rgba(0,200,83,0.05)`
- **Arrow icons:** `translateX(3–4px)` on parent hover

### Shadow & Elevation

- No box-shadows on cards at rest; glow only appears on hover (green glow) or on CTA buttons
- Orb glows created with `filter: blur()` not box-shadow

### Layout Rules

- **Nav:** `space-between` flex, `padding: 18–20px 28px`, thin bottom border
- **Hero:** Asymmetric CSS Grid — two columns, content left, floating cards right
- **Padding:** Consistent `28px` horizontal padding across sections
- **Divider:** Vertical line with rotating diamond jewel at center — green gradient fade in/out

### Iconography

See ICONOGRAPHY section in README below.

---

## Iconography

**Approach:** No dedicated icon set or icon font. Two strategies:
1. **Emoji as functional icons** — used in role tags and floating badges (⚽ 📋 🏟️ 🤝 🌎 📍). These act as quick-read pictograms in small UI chips.
2. **Text/symbol arrows** — `→` and `▶` used as directional affordances in buttons.
3. **CSS shapes** — diamonds, dots, and lines drawn in pure CSS (no SVG).
4. **Unicode stars** — `★` in badge labels.

**Substitution note:** No SVG icon library is referenced in the codebase. For UI kit purposes, **Lucide Icons** (CDN) is used as a structural stand-in for any needed system icons, matching the thin-stroke aesthetic.

**Logo:** Text-based. "ONE" in white + "CHANCE" in green, with an animated green dot between them. No image asset.

---

## File Index

```
README.md                        — This file
SKILL.md                         — Agent skill definition
colors_and_type.css              — CSS custom properties for colors, type, spacing
assets/                          — Brand assets (none extracted; see notes)
preview/                         — Design system card previews
  colors-brand.html
  colors-semantic.html
  type-scale.html
  type-specimens.html
  spacing-tokens.html
  components-buttons.html
  components-cards.html
  components-nav.html
  components-eyebrow.html
  components-stats.html
  components-ticker.html
  brand-logo.html
  brand-backgrounds.html
ui_kits/
  landing/
    README.md
    index.html
    Nav.jsx
    Hero.jsx
    Cards.jsx
    RoleStrip.jsx
    Ticker.jsx
```
