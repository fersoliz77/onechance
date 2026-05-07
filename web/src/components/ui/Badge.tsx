import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import type { ProfileStatus } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center gap-2 border-[0.5px] px-[14px] py-[5px] text-[11px] tracking-[0.07em] uppercase transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-oc-green/10 border-oc-green/25 text-oc-green rounded-[20px]',
        outline:
          'border-white/10 text-white/50 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const STATUS_CONFIG: Record<ProfileStatus, { label: string; bg: string; color: string; border: string }> = {
  published: { label: 'Publicado',   bg: 'rgba(0,200,83,0.1)',    color: '#00C853',              border: 'rgba(0,200,83,0.25)' },
  pending:   { label: 'En revisión', bg: 'rgba(255,180,0,0.1)',   color: '#FFB400',              border: 'rgba(255,180,0,0.25)' },
  draft:     { label: 'Borrador',    bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' },
  rejected:  { label: 'Rechazado',  bg: 'rgba(255,60,60,0.1)',   color: '#FF6060',              border: 'rgba(255,60,60,0.25)' },
  hidden:    { label: 'Oculto',      bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.08)' },
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: ProfileStatus
}

function Badge({ className, variant, status, ...props }: BadgeProps) {
  if (status && STATUS_CONFIG[status]) {
    const cfg = STATUS_CONFIG[status]
    return (
      <div
        className={cn('inline-flex items-center gap-1.5 border-[0.5px] px-[11px] py-[4px] text-[11px] tracking-[0.07em] uppercase rounded-[20px]', className)}
        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
        {cfg.label}
      </div>
    )
  }
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export default Badge
export { Badge, badgeVariants }
