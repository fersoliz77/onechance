import { useRef, useCallback } from 'react'

/**
 * Hook de rate limiting client-side.
 * Impide ejecutar la misma acción más de 1 vez por `delayMs` milisegundos.
 *
 * @param delayMs - Tiempo mínimo entre ejecuciones (default: 2000ms)
 * @returns `execute(key, fn)` — ejecuta `fn` solo si no está limitado
 */
export function useRateLimit(delayMs = 2000) {
  const lastCall = useRef<Map<string, number>>(new Map())

  const execute = useCallback((key: string, fn: () => void | Promise<void>) => {
    const now = Date.now()
    const last = lastCall.current.get(key) ?? 0
    if (now - last < delayMs) return
    lastCall.current.set(key, now)
    fn()
  }, [delayMs])

  return { execute }
}
