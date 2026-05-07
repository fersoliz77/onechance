# HeroPlayersTicker

Ticker minimalista y reutilizable para mostrar jugadores en una franja fija al fondo del viewport.

## Props

- `players: PlayerProfile[]` lista de jugadores publicados
- `visible: boolean` controla entrada/salida suave (ideal con `IntersectionObserver` del hero)
- `durationSeconds?: number` velocidad del loop infinito (default `64`)
- `className?: string` clases extra para variantes

## Comportamiento

- Loop continuo e infinito sin salto visual (duplica la pista internamente)
- Pausa en hover en desktop
- Respeta `prefers-reduced-motion`
- Mantiene estilo minimal: `nombre`, `posicion`, `pais` y punto lima como separador

## Uso recomendado

```tsx
<HeroPlayersTicker
  players={heroPlayers}
  visible={showHeroTicker}
  durationSeconds={64}
/>
```
