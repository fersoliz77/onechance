import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Tipos de acciones auditables en el panel de administración.
 */
export type AuditAction =
  | 'approve_profile'
  | 'reject_profile'
  | 'delete_video'
  | 'toggle_video'
  | 'set_featured'
  | 'set_role'
  | 'export_csv'

export interface AuditEntry {
  adminUid: string
  adminEmail: string
  action: AuditAction
  targetId: string
  targetType: string
  metadata?: Record<string, unknown>
  timestamp: ReturnType<typeof serverTimestamp>
}

/**
 * Escribe una entrada en la colección `adminAuditLog` de Firestore.
 * Falla silenciosamente para no interrumpir el flujo del admin.
 *
 * @example
 * await logAudit(firebaseUser, 'approve_profile', profile.uid, 'player', { name: profile.fullName })
 */
export async function logAudit(
  admin: { uid: string; email: string | null },
  action: AuditAction,
  targetId: string,
  targetType: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await addDoc(collection(db, 'adminAuditLog'), {
      adminUid:   admin.uid,
      adminEmail: admin.email ?? 'unknown',
      action,
      targetId,
      targetType,
      metadata: metadata ?? {},
      timestamp: serverTimestamp(),
    } satisfies AuditEntry)
  } catch (err) {
    // No interrumpir flujo admin por error de audit
    console.warn('[AuditLog] Error al registrar acción:', err)
  }
}
