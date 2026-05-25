import type { Role } from '@/types'

export type ConversationStatus = 'pending' | 'approved' | 'rejected' | 'archived'

export interface PendingMessage {
  id: string
  body: string
  sentAt: string
}

export interface Conversation {
  id: string
  fromUid: string
  fromName: string
  fromRole: Role
  toUid: string
  toName: string
  toRole: Role
  subject: string
  status: ConversationStatus
  messageCount: number
  messages: PendingMessage[]
  createdAt: string
  updatedAt: string
  moderatedAt?: string
  moderatorUid?: string
  moderatorEmail?: string
  rejectionReason?: string
}

// Safe version stripped of internal admin fields — returned to users
export type ConversationSafe = Omit<Conversation, 'rejectionReason' | 'moderatorUid' | 'moderatorEmail' | 'moderatedAt'>
