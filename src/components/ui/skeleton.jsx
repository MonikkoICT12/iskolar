import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('rounded-lg skeleton-shimmer', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
