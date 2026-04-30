# Scripts del proyecto (explicados simple)

Este documento es una guia rapida para entender los scripts del repo sin lenguaje tecnico complejo.

## Donde estan los scripts

- App web: `web/package.json`
- Workflow automatico (CI): `.github/workflows/web-ci.yml`

## Scripts de la app web

### `npm run dev`

- Que hace: levanta la app en modo desarrollo.
- Cuando usarlo: cuando estas programando y queres ver cambios en vivo.
- Resultado esperado: se abre el servidor local de Next.js.

### `npm run build`

- Que hace: genera la version de produccion de la app.
- Cuando usarlo: antes de desplegar o para validar que todo compila bien.
- Resultado esperado: build exitoso sin errores.

### `npm run start`

- Que hace: ejecuta la app ya construida en modo produccion.
- Cuando usarlo: para probar localmente como correria en un entorno real.
- Requisito: primero correr `npm run build`.

### `npm run lint`

- Que hace: revisa reglas de calidad y estilo del codigo (ESLint).
- Cuando usarlo: antes de subir cambios o abrir un PR.
- Resultado esperado: cero errores de lint.

### `npm run typecheck`

- Que hace: valida tipos de TypeScript sin compilar salida (`tsc --noEmit`).
- Cuando usarlo: antes de mergear, para evitar errores de tipos en runtime.
- Resultado esperado: cero errores de tipos.

## Workflow automatico (CI)

Archivo: `.github/workflows/web-ci.yml`

Este workflow corre automaticamente en cada `push` o `pull_request` cuando hay cambios en `web/**`.

Pasos que ejecuta:

1. Instala dependencias (`npm ci`)
2. Ejecuta lint (`npm run lint`)
3. Ejecuta typecheck (`npm run typecheck`)
4. Intenta build de produccion (`npm run build`)

Si alguno falla, GitHub marca el chequeo en rojo.

## Espacio para nuevos scripts

Cuando agreguemos scripts nuevos, documentarlos asi:

| Script | Que hace | Cuando usarlo | Riesgo si falla |
|---|---|---|---|
| `npm run <nombre>` | Explicacion simple | Ejemplo de uso real | Impacto claro |

Ejemplo:

| Script | Que hace | Cuando usarlo | Riesgo si falla |
|---|---|---|---|
| `npm run test` | Corre tests automaticos | Antes de mergear | Bugs pueden pasar a produccion |

## Regla del repo

Todo script nuevo en `package.json` debe venir con su explicacion en este archivo.
