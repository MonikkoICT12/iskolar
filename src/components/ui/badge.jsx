import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors outline-none focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'border-brand/25 bg-brand/15 text-brand',
        secondary:
          'border-brand-soft/80 bg-brand-soft/50 text-foreground',
        gold:
          'border-highlight/80 bg-highlight text-highlight-foreground',
        destructive:
          'border-red-300/80 bg-red-100/90 text-red-800',
        outline:
          'border-border bg-white/80 text-foreground backdrop-blur-sm',
        success:
          'border-brand bg-brand text-brand-foreground',
        warning:
          'border-highlight/80 bg-highlight/35 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
