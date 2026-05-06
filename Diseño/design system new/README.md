# Componentes Reutilizables — One Chance

## `glass-cards.css`

Cards con efecto glass (semitransparente + blur + tilt 3D opcional).

### Uso básico

```html
<link rel="stylesheet" href="components/glass-cards.css">

<!-- Card grande con tilt principal -->
<article class="oc-glass oc-glass--lg oc-glass--lime oc-tilt">
  <h3>Mateo R.</h3>
  <p>Delantero · 19 años</p>
</article>

<!-- Mini KPI -->
<div class="oc-glass oc-glass--sm oc-tilt-soft">
  <div class="oc-glass__label">Rendimiento</div>
  <div class="oc-glass__value">8.7 <span>/10</span></div>
  <span class="oc-glass__delta">+12%</span>
</div>

<!-- Mini KPI inclinado al revés -->
<div class="oc-glass oc-glass--sm oc-tilt-soft oc-tilt--down">
  <div class="oc-glass__label">Visitas</div>
  <div class="oc-glass__value">1.245</div>
</div>
```

### Modificadores

| Clase | Efecto |
|---|---|
| `.oc-glass--sm` / `--md` / `--lg` | Tamaño de padding y radio |
| `.oc-glass--lime` / `--violet` / `--blue` / `--neutral` | Tinte del borde y fondo |
| `.oc-tilt` | Tilt 3D principal (-6° / 3°) + flotación |
| `.oc-tilt-soft` | Tilt suave (-5° / 5°) + flotación |
| `.oc-tilt-soft.oc-tilt--down` | Tilt suave invertido |
| `.oc-tilt-flat` | Sin rotación, sólo flotación |

### Custom props (overrideables)

```css
.mi-card {
  --oc-tint: 255, 100, 50;   /* RGB del acento */
  --oc-bg-a: 0.30;           /* opacidad fondo */
  --oc-border-a: 0.35;       /* opacidad borde */
  --oc-blur: 30px;
  --oc-radius: 20px;
}
```
