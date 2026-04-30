# Professionalization Plan - OneChance

## Current state (quick scan)

- Stack: Next.js 16 + React 19 + TypeScript + Tailwind v4 (`web/package.json`).
- There is already progress on reusable UI (`web/src/components/ui`) and common layout primitives (`web/src/components/layout`).
- Main issue is **consistency**: many pages still use ad-hoc styles (inline rgba/hex and repeated card/filter/header patterns).
- Main scalability risk is **feature coupling in pages**: each route defines card UI, filters, and list behavior locally.

## What was improved in this pass

- Added a small shared helper `cn` for predictable class composition in `web/src/lib/cn.ts`.
- Introduced semantic CSS tokens in `web/src/app/globals.css`:
  - surface: `--oc-surface-1`, `--oc-surface-2`
  - border: `--oc-border-soft`, `--oc-border-strong`
  - text: `--oc-text-primary`, `--oc-text-muted`, `--oc-text-faint`
  - radius: `--oc-radius-xl`
- Refactored core UI primitives to use tokens + `cn`:
  - `web/src/components/ui/Button.tsx`
  - `web/src/components/ui/Input.tsx`
  - `web/src/components/ui/Select.tsx`
  - `web/src/components/ui/SurfaceCard.tsx`
  - `web/src/components/ui/PanelHeader.tsx`
  - `web/src/components/ui/InlineFiltersBar.tsx`
  - `web/src/components/ui/EmptyState.tsx`

## Recommended architecture to scale cleanly

### 1) Feature-first modules

Move page logic into feature folders:

- `web/src/features/players/`
- `web/src/features/coaches/`
- `web/src/features/clubs/`
- `web/src/features/agents/`

Each feature should contain:

- `components/` (cards, filters, list sections)
- `hooks/` (filter + fetch orchestration)
- `mappers/` (UI-safe transforms)
- `types/` (feature-local types if needed)

### 2) UI primitives and pattern components

Keep `components/ui` for atoms (Button, Input, Select) and create `components/patterns` for repeated structures:

- `ListPageHeader`
- `EntityGrid`
- `FilterPills`
- `EntityCardShell`

### 3) Token governance

Use only semantic tokens in components, avoid raw hex/rgba in JSX where possible:

- Colors and text tones from `:root` tokens
- Spacing from `--oc-space-*`
- Radius and control sizes from shared tokens

### 4) Data boundaries

Keep Firebase calls isolated under `web/src/lib` or feature data adapters; pages should not own query details.

### 5) Quality gates

- Lint in CI (`npm run lint`)
- Type-check in CI (`npx tsc --noEmit`)
- Optional: component tests for primitives and critical cards

## Suggested next implementation steps

1. Extract reusable `ListPageHeader` and migrate `jugadores`, `tecnicos`, `clubes`, `representantes`.
2. Extract reusable `EntityCardShell` and unify hover/border behavior.
3. Move each listing route to `features/*` and leave route files thin.
4. Replace remaining inline colors with semantic tokens.
5. Add CI workflow for lint + type-check.
