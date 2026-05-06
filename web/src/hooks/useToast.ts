import { useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'warn' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const add = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++counterRef.current}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800)
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg: string) => add('success', msg),
    error:   (msg: string) => add('error',   msg),
    warn:    (msg: string) => add('warn',     msg),
    info:    (msg: string) => add('info',     msg),
  }

  return { toasts, toast, remove }
}
