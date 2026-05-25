import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Tipos de acciones auditables en el panel de administración.
 */
export type AuditAction =
  | 'approve_profile'
  | 'reject_profile'
  | 'hide_profile'
  | 'publish_profile'
  | 'set_profile_pending'
  | 'set_profile_draft'
  | 'delete_video'
  | 'toggle_video'
  | 'set_featured'
  | 'set_role'
  | 'export_csv'
  | 'plan_create'
  | 'plan_update'
  | 'plan_delete'
  | 'message_approve'
  | 'message_reject'
  | 'message_unblock'

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
export interface RecentActivity {
  id: string
  action: AuditAction
  adminEmail: string
  targetType: string
  timestamp: string | null
}

const ACTION_LABEL: Record<AuditAction, string> = {
  approve_profile:    'Perfil aprobado',
  reject_profile:     'Perfil rechazado',
  hide_profile:       'Perfil ocultado',
  publish_profile:    'Perfil publicado',
  set_profile_pending:'Perfil marcado pendiente',
  set_profile_draft:  'Perfil movido a borrador',
  delete_video:       'Video eliminado',
  toggle_video:       'Video moderado',
  set_featured:       'Jugador destacado',
  set_role:           'Rol de usuario cambiado',
  export_csv:         'Exportación de datos',
  plan_create:        'Plan de suscripción creado',
  plan_update:        'Plan de suscripción actualizado',
  plan_delete:        'Plan de suscripción eliminado',
  message_approve:    'Conversación aprobada',
  message_reject:     'Conversación rechazada',
  message_unblock:    'Bloqueo de conversación levantado',
}

export async function getRecentAuditLogs(n = 5): Promise<RecentActivity[]> {
  try {
    const q = query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(n))
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data()
      const ts = data.timestamp?.toDate?.()?.toISOString() ?? null
      return {
        id: d.id,
        action: data.action as AuditAction,
        adminEmail: data.adminEmail ?? '',
        targetType: data.targetType ?? '',
        timestamp: ts,
        label: ACTION_LABEL[data.action as AuditAction] ?? data.action,
      }
    })
  } catch {
    return []
  }
}

export { ACTION_LABEL }

export async function logAudit(
  admin: { uid: string; email: string | null },
  action: AuditAction,
  targetId: string,
  targetType: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await addDoc(collection(db, 'admin_audit_logs'), {
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
