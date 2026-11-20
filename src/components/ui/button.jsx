import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-brand-foreground shadow-sm shadow-brand/20 hover:bg-brand/90 hover:shadow-md',
        gradient:
          'bg-gradient-to-r from-[#587529] via-[#648425] to-[#71951E] text-white shadow-md shadow-[#587529]/20 hover:brightness-105 hover:shadow-lg',
        gold:
          'bg-highlight text-highlight-foreground font-semibold shadow-sm hover:bg-highlight/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-border bg-white/80 backdrop-blur-md text-foreground shadow-sm hover:bg-accent hover:border-brand/35',
        secondary:
          'bg-brand-soft/65 text-brand-soft-foreground border border-brand-soft shadow-sm hover:bg-brand-soft/85',
        ghost:
          'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-xl px-6 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
