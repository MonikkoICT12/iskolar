import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

const PaginationLink = ({ className, isActive, size = 'icon', ...props }) => (
  <button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'default' : 'outline',
        size,
      }),
      'h-8 w-8 text-xs',
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({ className, ...props }) => (
  <button
    type="button"
    aria-label="Go to previous page"
    className={cn(
      buttonVariants({ variant: 'outline', size: 'sm' }),
      'gap-1 pl-2.5 h-8 text-xs',
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-3.5 w-3.5" />
    <span>Previous</span>
  </button>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({ className, ...props }) => (
  <button
    type="button"
    aria-label="Go to next page"
    className={cn(
      buttonVariants({ variant: 'outline', size: 'sm' }),
      'gap-1 pr-2.5 h-8 text-xs',
      className
    )}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-3.5 w-3.5" />
  </button>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn('flex h-8 w-8 items-center justify-center text-muted-foreground', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
