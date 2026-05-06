import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-center text-sm font-semibold leading-none tracking-[-0.01em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-oc-yellow/50 disabled:pointer-events-none disabled:opacity-50 no-underline cursor-pointer group',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(135deg,#FFD24A_0%,#FFB400_56%,#F59E0B_100%)] text-[#1A1200] border-[0.5px] border-[rgba(255,205,102,0.65)] shadow-[0_10px_28px_rgba(255,180,0,0.32)] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(255,180,0,0.42)]',
        ghost:
          'bg-transparent border-[0.5px] border-white/20 text-white/40 hover:text-white hover:border-white/40',
        outline:
          'border-[0.5px] border-white/20 bg-transparent hover:bg-white/5 text-white',
      },
      size: {
        default: 'h-11 min-w-[130px] px-7 py-2.5 text-[14px]',
        sm: 'h-10 min-w-[116px] rounded-[9px] px-7 text-[13px]',
        lg: 'h-[50px] min-w-[220px] px-12 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
