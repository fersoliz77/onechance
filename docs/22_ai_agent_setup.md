# Configuración de agentes IA — Antigravity, OpenCode, Claude Code

> Implementado: 2026-05-25
> Objetivo: que cualquier herramienta IA que toque el repo conozca las reglas del proyecto desde el primer mensaje.

---

## Herramientas usadas en este proyecto

| Herramienta | Motor | Archivo de reglas prioritario |
|---|---|---|
| Claude Code (CLI) | Claude (Anthropic) | `web/CLAUDE.md` → `AGENTS.md` + `FIREBASE.md` |
| Antigravity IDE | Gemini (Google) | `GEMINI.md` |
| OpenCode (terminal) | Claude + OpenAI Codex | `AGENTS.md` + `opencode.json` |
| GitHub Copilot | OpenAI | `.github/copilot-instructions.md` |
| Cualquier otra IA | — | `AGENTS.md` (diseñado como cross-tool) |

---

## Archivos de reglas en el repo

### `AGENTS.md` (raíz del repo)
Archivo principal. Cubre todas las reglas del proyecto sin sintaxis específica de ninguna herramienta.
Lo leen: OpenCode, Claude Code, y cualquier IA que no tenga archivo propio.

Contenido:
- Estructura del proyecto
- Reglas Firebase (repo como fuente de verdad, deploy command, Admin SDK)
- Realtime sobre polling (onSnapshot/onValue, nunca setInterval+fetch)
- Plan Spark — Cloud Functions prohibidas
- Next.js 16 (params async)
- Convenciones de idioma (UI español, código inglés)
- Tabla de paths Firebase clave

### `web/FIREBASE.md`
Referencia técnica detallada de Firebase. Sin sintaxis específica de herramienta.
Lo leen: todos los tools (incluido via `AGENTS.md` que lo referencia).

Contenido:
- Las 4 reglas fundamentales de Firebase (repo como fuente, deploy conjunto, verificar prod, Admin SDK)
- Tablas completas de colecciones Firestore y paths RTDB con permisos
- Qué NO hacer

### `GEMINI.md` (raíz del repo)
Instrucciones para Antigravity IDE con Gemini. Formato compacto (<500 tokens), reglas críticas destacadas.
Antigravity lo detecta automáticamente por el nombre `GEMINI.md` en la raíz.

### `opencode.json` (raíz del repo)
```json
{ "instructions": ["AGENTS.md", "web/FIREBASE.md"] }
```
OpenCode CLI lee este JSON y carga los archivos listados como contexto de sistema.

### `web/opencode.json`
```json
{ "instructions": ["../AGENTS.md", "FIREBASE.md"] }
```
Alternativa para cuando se corre OpenCode desde el directorio `web/`.

### `web/CLAUDE.md`
```
@../AGENTS.md
@AGENTS.md
@FIREBASE.md
```
Claude Code usa la sintaxis `@archivo` para incluir archivos como contexto adicional.
Carga 3 fuentes: reglas raíz, reglas web, y reglas Firebase.

### `web/AGENTS.md`
Instrucciones específicas para el subdirectorio `web/`. Referencia al AGENTS.md raíz y
agrega el recordatorio crítico de Next.js 16 (params async).

### `.github/copilot-instructions.md`
Instrucciones para GitHub Copilot (Chat y completions con contexto de repo).
Cubre las reglas Firebase, realtime, Spark plan y convenciones.

---

## Cómo funciona la carga de reglas por herramienta

### Antigravity + Gemini
Antigravity busca en este orden:
1. `GEMINI.md` en la raíz del repo → carga automático
2. `AGENTS.md` en la raíz → carga como contexto adicional

El archivo `GEMINI.md` tiene las reglas más críticas en menos de 500 tokens para que
quepan en el contexto inicial sin empujar contexto útil fuera de la ventana.

### OpenCode (terminal)
OpenCode lee `opencode.json` en el directorio donde se invoca. Carga los archivos listados
en `instructions[]` como archivos de sistema. Funciona independientemente del modelo usado
(Claude, OpenAI, etc.) porque la carga de archivos es responsabilidad del IDE, no del modelo.

### Claude Code (CLI/IDE)
Claude Code lee `CLAUDE.md` automáticamente. La sintaxis `@archivo` permite componer
múltiples fuentes de instrucciones sin duplicar contenido.

---

## Reglas críticas que todos los archivos comparten

1. **Repo = única fuente de verdad para Firebase**
   `firestore.rules`, `database.rules.json`, `firestore.indexes.json` en `web/` son canónicos.
   Nunca editar desde la consola de Firebase.

2. **Deploy siempre los tres juntos**
   ```bash
   cd web && firebase deploy --only firestore:rules,firestore:indexes,database
   ```

3. **Realtime, nunca polling**
   `onSnapshot` (Firestore) o `onValue` (RTDB). Nunca `setInterval` + `fetch`.
   Siempre retornar unsubscribe en `useEffect` cleanup.

4. **Sin Cloud Functions**
   El proyecto está en Firebase Spark (gratuito). Cloud Functions requiere Blaze (pago).
   Toda lógica server-side va en Next.js API routes (`web/src/app/api/`).

5. **Next.js 16 — params son async**
   ```ts
   const { id } = await params   // correcto
   const { id } = params          // incorrecto — rompe en producción
   ```

6. **Idioma**
   Texto UI y lógica de negocio → español. Identificadores de código → inglés.

---

## Agregar soporte para una nueva herramienta IA

Si en el futuro se usa una herramienta nueva:

1. Revisar su documentación oficial para saber qué archivo de contexto lee (por convención o config)
2. Si tiene un archivo convencional (ej: `CURSOR.md`, `COPILOT.md`): crearlo con las reglas críticas
3. Si tiene config JSON/YAML: agregar referencia a `AGENTS.md` y `web/FIREBASE.md`
4. Si no tiene ningún mecanismo: pasarle `AGENTS.md` manualmente al inicio de cada sesión
5. Actualizar este documento con la nueva herramienta

El contenido de las reglas **no** cambia entre herramientas — solo el formato de carga.
`AGENTS.md` es el archivo canónico de reglas; los demás son adaptadores de formato.
