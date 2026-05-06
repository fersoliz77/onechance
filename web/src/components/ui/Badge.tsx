import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-2 border-[0.5px] px-[14px] py-[5px] text-[10px] tracking-[0.07em] uppercase transition-colors',
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

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export default Badge
export { Badge, badgeVariants }
