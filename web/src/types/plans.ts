import type { Role } from '@/types'

export type PlanInterval = 'monthly' | 'yearly'
export type PlanCurrency = 'USD' | 'ARS'

export interface SubscriptionPlan {
  id:            string
  name:          string
  role:          Role
  price:         number
  currency:      PlanCurrency
  interval:      PlanInterval
  features:      string[]
  isActive:      boolean
  isFeatured:    boolean
  order:         number
  stripePriceId?: string
  createdAt:     string
  updatedAt:     string
}

export type PlanDraft = Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
