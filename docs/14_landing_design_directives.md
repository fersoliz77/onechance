# Landing design directives applied

This document describes how the new `Diseño/` directives were integrated into the web app.

## Core decisions

- The platform now uses the same primary visual tokens from the new design system in `web/src/app/globals.css`.
- The landing page was rebuilt as reusable sections with shared patterns (hero, section titles, value cards, talent grid, final CTA).
- Glass cards were standardized with reusable classes: `oc-glass`, `oc-glass--sm`, `oc-glass--lg`, `oc-glass--lime`, `oc-glass--violet`, `oc-tilt`, `oc-tilt-soft`.

## Asset mapping

- `Diseño/imagenes/hero-stadium.png` was copied to `web/public/images/hero-stadium.png`.
- Landing hero now uses `/images/hero-stadium.png` as primary backdrop to match the provided mockup look.

## Responsiveness strategy

- Hero uses a two-column desktop layout and single-column stacking on tablet/mobile.
- Cards, CTAs, and stat blocks collapse cleanly at small widths.
- Talent grid adapts from 6 columns (desktop) to 3 (tablet) and 2 (mobile).
- Navbar includes a mobile menu path for <= `lg` breakpoints.

## Reuse guidance

- Keep new sections in `web/src/app/page.tsx` as section-level components.
- Reuse `SectionTitle` and `oc-glass` classes for any future marketing pages.
- Prefer semantic CSS variables from `:root` over hard-coded colors for consistency.

## Current status note

- Landing already follows the visual direction, but still contains sections with hard-coded values and inline styles in `web/src/app/page.tsx`.
- Next cleanup step is to split landing into section components and keep style decisions in reusable tokens/classes.
