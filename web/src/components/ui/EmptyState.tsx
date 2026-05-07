import { cn } from '@/lib/cn'

type Props = {
  message: string
  className?: string
}

export default function EmptyState({ message, className = '' }: Props) {
  return <div className={cn('text-center py-16 text-[var(--oc-text-faint)] text-[14px]', className)}>{message}</div>
}
